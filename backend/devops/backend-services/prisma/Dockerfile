FROM postgres:alpine3.21

RUN apk add --no-cache nodejs npm curl jq socat openssl

COPY --chmod=700 --chown=postgres:postgres tools/prisma.sh /tools/prisma.sh

WORKDIR  /app

COPY --chown=postgres:postgres tools/prisma.config.mjs  .

ENV HOME=/app

COPY --chown=postgres:postgres prisma-tables/. ./prisma/

RUN npm install prisma@5.2 @prisma/client@5.2 typescript tsx dotenv && \
    chown -R 70:70 "/app/.npm" && \
    chown -R 70:70 /app

USER postgres

ENTRYPOINT ["/tools/prisma.sh"]
