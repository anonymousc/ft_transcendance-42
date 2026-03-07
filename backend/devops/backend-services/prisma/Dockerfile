FROM postgres:alpine3.21

RUN apk add --no-cache curl jq openssl

COPY --chmod=700 --chown=postgres:postgres tools/prisma.sh /tools/prisma.sh

WORKDIR /app

ENV HOME=/app

RUN chown -R 70:70 /app

RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'mkdir -p /var/logs && chown postgres:postgres /var/logs && chmod 755 /var/logs' >> /docker-entrypoint.sh && \
    echo 'exec gosu postgres /tools/prisma.sh "$@"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
