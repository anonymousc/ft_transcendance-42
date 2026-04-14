import json
import logging
import os
import queue
import re
import threading
import time
from datetime import datetime, timezone
from pathlib import Path

import docker
import requests
from docker.errors import APIError

LOG = logging.getLogger("logbull-forwarder")
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s %(levelname)s %(message)s",
)

LOGBULL_BASE_URL = os.getenv("LOGBULL_BASE_URL", "http://logbull:4005").rstrip("/")
LOGBULL_PROJECT_ID = os.getenv("LOGBULL_PROJECT_ID", "").strip()
LOGBULL_API_KEY = os.getenv("LOGBULL_API_KEY", "").strip()
LOGBULL_ORIGIN = os.getenv("LOGBULL_ORIGIN", "").strip()
BATCH_SIZE = int(os.getenv("LOGBULL_BATCH_SIZE", "200"))
FLUSH_INTERVAL_SECONDS = float(os.getenv("LOGBULL_FLUSH_INTERVAL_SECONDS", "1.0"))
MAX_QUEUE_SIZE = int(os.getenv("LOGBULL_MAX_QUEUE_SIZE", "50000"))
DOCKER_LOGS_DIR = Path(os.getenv("DOCKER_LOGS_DIR", "/var/lib/docker/containers"))

EXCLUDED_CONTAINERS = {
    item.strip()
    for item in os.getenv(
        "LOGBULL_EXCLUDED_CONTAINERS", "logbull,logbull-forwarder"
    ).split(",")
    if item.strip()
}

LEVEL_PATTERNS = [
    (re.compile(r"\b(ERROR|ERR|FATAL|CRITICAL)\b", re.IGNORECASE), "ERROR"),
    (re.compile(r"\b(WARN|WARNING)\b", re.IGNORECASE), "WARN"),
    (re.compile(r"\bDEBUG\b", re.IGNORECASE), "DEBUG"),
    (re.compile(r"\b(INFO|INFORMATION)\b", re.IGNORECASE), "INFO"),
]


def infer_level(message: str) -> str:
    for pattern, level in LEVEL_PATTERNS:
        if pattern.search(message):
            return level
    return "INFO"


def trim_message(message: str) -> str:
    max_len = 10000
    if len(message) <= max_len:
        return message
    return message[: max_len - 3] + "..."


class Forwarder:
    def __init__(self) -> None:
        self.client = None
        self.session = requests.Session()
        self.events_queue: queue.Queue[dict] = queue.Queue(maxsize=MAX_QUEUE_SIZE)
        self.known_containers: set[str] = set()
        self.running = True
        self.container_meta_cache: dict[str, dict] = {}

        try:
            client = docker.DockerClient(base_url="unix:///var/run/docker.sock")
            client.ping()
            self.client = client
            LOG.info("Using docker.sock mode for log collection")
        except Exception as error:  # noqa: BLE001
            LOG.warning(
                "docker.sock unavailable (%s); falling back to Docker JSON log files at %s",
                error,
                DOCKER_LOGS_DIR,
            )

    @property
    def endpoint(self) -> str:
        return f"{LOGBULL_BASE_URL}/api/v1/logs/receiving/{LOGBULL_PROJECT_ID}"

    def enqueue_log(self, item: dict) -> None:
        try:
            self.events_queue.put_nowait(item)
        except queue.Full:
            LOG.warning("Events queue full, dropping log item")

    def build_log_item(self, container, raw_line: bytes) -> dict | None:
        text = raw_line.decode("utf-8", errors="replace").strip()
        if not text:
            return None

        service = (
            container.labels.get("service")
            or container.labels.get("com.docker.compose.service")
            or container.name
        )

        stream = "stdout"
        if text.startswith("stderr "):
            stream = "stderr"
            text = text[7:]
        elif text.startswith("stdout "):
            text = text[7:]

        return {
            "level": infer_level(text),
            "message": trim_message(text),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "fields": {
                "container": container.name,
                "service": service,
                "stream": stream,
                "source": "docker",
                "image": container.image.tags[0] if container.image.tags else "",
            },
        }

    def build_log_item_from_parts(
        self,
        *,
        text: str,
        container_name: str,
        service: str,
        stream: str,
        image: str,
        timestamp: str | None,
    ) -> dict | None:
        text = text.strip()
        if not text:
            return None

        return {
            "level": infer_level(text),
            "message": trim_message(text),
            "timestamp": timestamp or datetime.now(timezone.utc).isoformat(),
            "fields": {
                "container": container_name,
                "service": service,
                "stream": stream,
                "source": "docker-json-file",
                "image": image,
            },
        }

    def stream_container_logs(self, container_id: str) -> None:
        if self.client is None:
            return

        try:
            container = self.client.containers.get(container_id)
        except APIError as error:
            LOG.warning("Failed to resolve container %s: %s", container_id, error)
            return

        if container.name in EXCLUDED_CONTAINERS:
            return

        LOG.info("Streaming logs from container=%s", container.name)

        try:
            for line in container.logs(stream=True, follow=True, tail=0):
                if not self.running:
                    return
                item = self.build_log_item(container, line)
                if item is not None:
                    self.enqueue_log(item)
        except Exception as error:  # noqa: BLE001
            LOG.warning("Stopped log stream for %s: %s", container.name, error)

    def watch_containers(self) -> None:
        if self.client is None:
            return

        while self.running:
            try:
                containers = self.client.containers.list(filters={"status": "running"})
                for container in containers:
                    if container.id in self.known_containers:
                        continue
                    if container.name in EXCLUDED_CONTAINERS:
                        self.known_containers.add(container.id)
                        continue
                    self.known_containers.add(container.id)
                    thread = threading.Thread(
                        target=self.stream_container_logs,
                        args=(container.id,),
                        daemon=True,
                    )
                    thread.start()
            except Exception as error:  # noqa: BLE001
                LOG.warning("Container watcher error: %s", error)

            time.sleep(5)

    def iter_json_log_files(self) -> list[Path]:
        if not DOCKER_LOGS_DIR.exists():
            return []
        return list(DOCKER_LOGS_DIR.glob("*/**/*-json.log"))

    def read_container_meta(self, container_id: str) -> dict:
        if container_id in self.container_meta_cache:
            return self.container_meta_cache[container_id]

        config_path = DOCKER_LOGS_DIR / container_id / "config.v2.json"
        meta = {
            "container": container_id,
            "service": container_id,
            "image": "",
            "skip": False,
        }

        try:
            content = json.loads(config_path.read_text())
            container_name = content.get("Name", "").lstrip("/") or container_id
            labels = content.get("Config", {}).get("Labels", {}) or {}
            service_name = labels.get("service") or labels.get("com.docker.compose.service") or container_name
            image_name = content.get("Config", {}).get("Image", "")
            should_skip = container_name in EXCLUDED_CONTAINERS or service_name in EXCLUDED_CONTAINERS

            meta = {
                "container": container_name,
                "service": service_name,
                "image": image_name,
                "skip": should_skip,
            }
        except Exception as error:  # noqa: BLE001
            LOG.debug("Failed reading metadata for %s: %s", container_id, error)

        self.container_meta_cache[container_id] = meta
        return meta

    def watch_json_files(self) -> None:
        offsets: dict[Path, int] = {}
        LOG.info("Watching Docker JSON logs in %s", DOCKER_LOGS_DIR)

        while self.running:
            for log_path in self.iter_json_log_files():
                container_id = log_path.parent.name
                meta = self.read_container_meta(container_id)
                if meta.get("skip"):
                    continue

                try:
                    previous_offset = offsets.get(log_path, 0)
                    with log_path.open("r", encoding="utf-8", errors="replace") as stream:
                        stream.seek(previous_offset)
                        for line in stream:
                            try:
                                entry = json.loads(line)
                            except json.JSONDecodeError:
                                continue

                            item = self.build_log_item_from_parts(
                                text=entry.get("log", ""),
                                container_name=meta["container"],
                                service=meta["service"],
                                stream=entry.get("stream", "stdout"),
                                image=meta["image"],
                                timestamp=entry.get("time"),
                            )
                            if item is not None:
                                self.enqueue_log(item)

                        offsets[log_path] = stream.tell()
                except FileNotFoundError:
                    offsets.pop(log_path, None)
                except Exception as error:  # noqa: BLE001
                    LOG.warning("Error tailing %s: %s", log_path, error)

            time.sleep(1)

    def post_batch(self, batch: list[dict]) -> bool:
        payload = {"logs": batch}
        headers = {"Content-Type": "application/json"}

        if LOGBULL_API_KEY:
            headers["X-API-Key"] = LOGBULL_API_KEY
        if LOGBULL_ORIGIN:
            headers["Origin"] = LOGBULL_ORIGIN

        try:
            response = self.session.post(
                self.endpoint,
                headers=headers,
                data=json.dumps(payload),
                timeout=15,
            )
        except requests.RequestException as error:
            LOG.warning("Failed to send logs: %s", error)
            return False

        if response.status_code == 202:
            LOG.info("Sent batch accepted=%s", len(batch))
            return True

        LOG.warning(
            "Logbull rejected batch status=%s body=%s",
            response.status_code,
            response.text[:500],
        )
        return False

    def flush_loop(self) -> None:
        pending: list[dict] = []

        while self.running:
            deadline = time.time() + FLUSH_INTERVAL_SECONDS

            while len(pending) < BATCH_SIZE:
                timeout = max(0.0, deadline - time.time())
                if timeout == 0 and pending:
                    break
                try:
                    pending.append(self.events_queue.get(timeout=timeout))
                except queue.Empty:
                    break

            if not pending:
                continue

            batch = pending[:BATCH_SIZE]
            success = self.post_batch(batch)

            if success:
                pending = pending[BATCH_SIZE:]
            else:
                time.sleep(2)

    def run(self) -> None:
        if not LOGBULL_PROJECT_ID:
            LOG.warning(
                "LOGBULL_PROJECT_ID is not set. Forwarder is idle until it is configured."
            )
            while True:
                time.sleep(30)

        if self.client is not None:
            threading.Thread(target=self.watch_containers, daemon=True).start()
        else:
            threading.Thread(target=self.watch_json_files, daemon=True).start()

        self.flush_loop()


if __name__ == "__main__":
    Forwarder().run()
