FROM postgres:alpine3.21

RUN apk add --no-cache curl jq openssl

COPY --chmod=700 --chown=postgres:postgres tools/prisma.sh /tools/prisma.sh

WORKDIR  /app

ENV HOME=/app

RUN npm install prisma@5.2 @prisma/client@5.2 typescript tsx dotenv && \
    chown -R 70:70 "/app/.npm" && \
    chown -R 70:70 /app && \
    mkdir -p /var/logs && \
    chown -R 70:70 /var/logs && \
    chmod -R 777 /var/logs
USER postgres

ENTRYPOINT ["/tools/prisma.sh"]
