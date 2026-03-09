FROM ghcr.io/cthonney/maptoposter-docker:latest

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    jq \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --chmod=755 entrypoint.sh /usr/local/bin/entrypoint.sh

EXPOSE 5025

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:5025/ || exit 1

ENTRYPOINT ["sh", "/usr/local/bin/entrypoint.sh"]