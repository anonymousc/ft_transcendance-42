FROM ghcr.io/cthonney/maptoposter-docker:latest AS build

FROM alpine:3.21

RUN apk add --no-cache \
    nodejs \
    npm \
    curl \
    jq \
    && rm -rf /var/cache/apk/*

WORKDIR /app

COPY --from=build /app/ ./

RUN addgroup -g 1000 maptoposter && \
    adduser -u 1000 -G maptoposter -s /bin/sh -D maptoposter && \
    chown -R maptoposter:maptoposter /app

COPY --chmod=755 entrypoint.sh /usr/local/bin/entrypoint.sh

USER maptoposter

EXPOSE 8082

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:8082/health || exit 1

ENTRYPOINT ["entrypoint.sh"]