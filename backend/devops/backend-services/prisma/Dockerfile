
FROM postgres:alpine3.18

RUN apk add --no-cache nodejs npm

COPY --chmod=766 --chown=postgres:postgres tools/prisma.sh /tools/prisma.sh

COPY --chmod=644 --chown=postgres:postgres tools/postgres.conf /var/lib/postgresql/data/postgresql.conf

USER postgres

ENTRYPOINT ["/tools/prisma.sh"]