#!/bin/sh

set -eu

curl -X GET http://vault:6666/v1/secret/data/postgres --header "X-Vault-Token: $(jq -r .auth.client_token < /token/token)" --silent --output /token/data

jq -r .data.data.password < /token/data > /token/passfile

export PGPORT=$PORT_POSTGRES

initdb -U $(jq -r .data.data.username < /token/data) --pwfile=/token/passfile -A scram-sha-256 

sed -i -e "s/#port = 5432/port = $PORT_POSTGRES/g" $PGDATA/postgresql.conf
# sed -i "s/#log_directory = 'log'/log_directory = '\/var\/log\/'/g" $PGDATA/postgresql.conf
# sed -i "s/#logging_collector = off/logging_collector = on/g" $PGDATA/postgresql.conf


rm -rf /token/passfile

pg_ctl  -o "-p $PGPORT -c listen_addresses='*'" start 

echo "host all all 0.0.0.0/0 scram-sha-256" >> /var/lib/postgresql/18/docker/pg_hba.conf

export PGPASSWORD=$(jq -r .data.data.password < /token/data)
createdb -U $(jq -r .data.data.username < /token/data) prisma 

DB_USER=$(jq -r .data.data.username < /token/data)
RAW_PASS=$(jq -r .data.data.password < /token/data)

export DATABASE_URL="postgresql://${DB_USER}:${RAW_PASS}@localhost:${PORT_POSTGRES}/prisma?schema=public"

npx prisma db push

echo "Seeding..."
node /app/prisma/seed.js

pg_ctl reload

pg_ctl stop

rm -rf /token/data

npx prisma studio --port 5556 --browser none &

socat TCP-LISTEN:5555,fork,bind=0.0.0.0 TCP:127.0.0.1:5556 &

exec postgres
