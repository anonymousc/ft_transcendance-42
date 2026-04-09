# WebSocket Service — Backend Handoff

> **Who is this for?**  
> The teammate building `websock-service`. The frontend is already wired and waiting.  
> This document is everything you need to make it connect without touching any React code.

---

## 1. What the frontend expects

The frontend hook lives at:
```
frontend/src/features/chat/hooks/useWebSocket.ts
```
It connects to `VITE_WS_URL` (set in `frontend/.env`). When that variable is absent the UI runs in mock mode — your backend only needs to match the contract below.

The complete TypeScript contract is in:
```
frontend/src/features/chat/types.ts
```
Everything in sections 3 and 4 of this document is derived directly from that file.

---

## 2. Environment variables

### Frontend (`frontend/.env`)
```env
VITE_WS_URL=ws://localhost:8000
```
Set this to switch the UI from mock mode to your real backend. Leave it unset to run the frontend without any backend at all.

### Your service (`.env` in this directory)
```env
PORT=8000
JWT_ACCESS_SECRET=<same value used by auth-service>
```
You need the **same** `JWT_ACCESS_SECRET` as `auth-service` to verify tokens locally (same pattern as `planner-service`).

---

## 3. Connection handshake

The frontend opens the socket like this:
```
ws://<host>:<port>?userId=<JWT-sub>
```

The `userId` query param is the **JWT `sub` claim** — a UUID string that matches the `User.id` in the Postgres database.

> **You must validate the JWT on every new connection.** Reject the handshake with code `4001` if the token is missing, expired, or invalid. The `JWT_ACCESS_SECRET` is shared with `auth-service`.

---

## 4. Message contract

All frames are JSON. Every frame follows the envelope structure:
```json
{
  "type": "<event type>",
  "payload": { ... },
  "timestamp": "<ISO 8601 string>"
}
```

### 4.1 Client → Server (what you receive)

#### `send_message`
Sent when the user hits Send. The `tempId` is a client-generated string used to match your ACK back to the optimistic message already displayed in the UI.

```json
{
  "type": "send_message",
  "payload": {
    "conversationId": "conv-abc123",
    "content":        "Hey, are you free this weekend?",
    "tempId":         "temp-1711580000000"
  }
}
```

### 4.2 Server → Client (what you must send)

#### `message_ack` — REQUIRED
Send this immediately after you persist a message. It tells the UI to replace the optimistic bubble with the confirmed one.

```json
{
  "type":      "message_ack",
  "timestamp": "2026-03-27T14:00:00.000Z",
  "payload": {
    "tempId": "temp-1711580000000",
    "id":     "msg-uuid-from-db",
    "status": "sent"
  }
}
```

> ⚠️ If you do not send `message_ack`, the bubble stays greyed-out at "sending" permanently.

#### `message` — REQUIRED
Send this to **all other participants** of the conversation in real time (fan-out). Also send it to the sender on a second device if you support multi-device.

```json
{
  "type":      "message",
  "timestamp": "2026-03-27T14:00:00.000Z",
  "payload": {
    "id":             "msg-uuid-from-db",
    "conversationId": "conv-abc123",
    "senderId":       "user-uuid",
    "content":        "Hey, are you free this weekend?",
    "status":         "sent",
    "timestamp":      "2026-03-27T14:00:00.000Z"
  }
}
```

> ⚠️ `payload.timestamp` must be an **ISO 8601 string**, not a number. The frontend calls `new Date(payload.timestamp)` on it directly.

#### `typing` — optional (UI renders nothing for it yet)
```json
{
  "type":      "typing",
  "timestamp": "2026-03-27T14:00:01.000Z",
  "payload": {
    "conversationId": "conv-abc123",
    "senderId":       "user-uuid",
    "isTyping":       true
  }
}
```

#### `error` — optional but recommended
Send this when something goes wrong with a client's request (e.g. conversation not found, forbidden).
```json
{
  "type":      "error",
  "timestamp": "2026-03-27T14:00:01.000Z",
  "payload": {
    "code":    "CONVERSATION_NOT_FOUND",
    "message": "Conversation conv-abc123 does not exist"
  }
}
```

---

## 5. Message status lifecycle

The `status` field on a message follows this progression:

```
sending  →  sent  →  delivered  →  read
              ↓
            failed   (if the socket was closed before the server ACKed)
```

| Status      | Set by    | When |
|-------------|-----------|------|
| `sending`   | Frontend  | Optimistic — immediately on Send |
| `sent`      | Backend   | `message_ack` received |
| `delivered` | Backend   | Future: when the recipient's socket receives the `message` frame |
| `read`      | Backend   | Future: when the recipient opens the conversation |
| `failed`    | Frontend  | Socket was closed before `message_ack` arrived |

For the first iteration you only need to implement `sent`. `delivered` and `read` can come later.

---

## 6. Conversation & history loading

The frontend currently initialises conversations from **mock data**. When you are ready:

1. Add a REST endpoint (or a WebSocket `init` frame on connect) that returns the user's conversation list and recent message history.
2. The frontend hook accepts `initialConversations` and `initialMessages` — you can seed these from a REST call before the socket opens, or send them as the first frame after the handshake.

Suggested REST endpoints (not yet in nginx, add them):
```
GET /ws/conversations          → Conversation[]
GET /ws/conversations/:id/messages?limit=50&before=<cursor>  → Message[]
```

---

## 7. Architecture & placement

```
Browser  ──WS──▶  nginx :80  ──▶  websock-service :8000
                                         │
                              ┌──────────┴──────────┐
                              │                     │
                        auth-service          Postgres DB
                      (JWT validation)     (persist messages)
```

- Register the service on the `saas` Docker network like all other services.
- Validate JWT on connect by verifying with `JWT_ACCESS_SECRET` locally (same as `planner-service/src/middleware/auth.js`).
- Persist messages to Postgres (separate DB or shared — your choice; use Prisma).
- Add nginx proxy block for `/ws` in `backend/devops/nginx/nginx.conf`:

```nginx
location /ws {
    proxy_pass         http://websock-service:8000;
    proxy_http_version 1.1;
    proxy_set_header   Upgrade    $http_upgrade;
    proxy_set_header   Connection "upgrade";
    proxy_set_header   Host       $host;
    proxy_read_timeout 3600s;
}
```

> **Important:** WebSocket upgrades require `proxy_http_version 1.1` and the `Upgrade` / `Connection` headers. Without these, nginx will close the connection immediately.

---

## 8. docker-compose entry

Add this block to `docker-compose.yml` alongside the other services:

```yaml
websock-service:
  build: ./backend/src/websock-service
  container_name: websock-service
  expose:
    - "8000"
  environment:
    - PORT=8000
    - PORT_VAULT=${PORT_VAULT}
  networks:
    - saas
  depends_on:
    database:
      condition: service_started
    vault:
      condition: service_healthy
  healthcheck:
    test: ["CMD-SHELL", "wget -qO- http://localhost:8000/health || exit 1"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 30s
  restart: on-failure
  labels:
    - "service=websock-service"
```

Note `expose` not `ports` — nginx is the only entry point. Also add `websock-service` to the `depends_on` block of the `nginx` service.

---

## 9. Verifying it works end-to-end

1. Start your service and the frontend.
2. Set `VITE_WS_URL=ws://localhost:8000` in `frontend/.env` and restart Vite.
3. Open the chat page. The sidebar should show **● Connected** (green badge).
4. Send a message. The bubble should go from grey ("sending") to solid ("sent") within ~100 ms.
5. Open a second browser tab / window as a different user. A message sent in tab 1 should appear in real time in tab 2.

If the badge shows **○ Connecting…** for more than 2 seconds, check:
- `JWT_ACCESS_SECRET` matches `auth-service`.
- The `userId` query param is a valid JWT `sub` UUID (logged in user, not guest).
- Nginx has the `Upgrade` / `Connection` headers (section 7).

---

## 10. Quick reference

| Item | Value |
|------|-------|
| Default port | `8000` |
| Nginx location | `/ws` |
| Frontend env var | `VITE_WS_URL` |
| Connect URL | `ws://<host>/ws?userId=<jwt-sub>` |
| JWT claim for user ID | `sub` |
| JWT secret env var | `JWT_ACCESS_SECRET` |
| Frontend contract file | `frontend/src/features/chat/types.ts` |
| Frontend hook | `frontend/src/features/chat/hooks/useWebSocket.ts` |
| Required server frames | `message`, `message_ack` |
| Optional server frames | `typing`, `error` |
| Timestamp format | ISO 8601 string (`new Date().toISOString()`) |
