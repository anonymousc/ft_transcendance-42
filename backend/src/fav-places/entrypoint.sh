#!/bin/sh

set -eu

echo "[fav-places] Starting..."

echo "[fav-places] Waiting for /data/fav_places_token..."
while [ ! -r /data/fav_places_token ]; do
    sleep 2
done

VAULT_TOKEN=$(jq -r .auth.client_token < /data/fav_places_token)

echo "[fav-places] Fetching database credentials from Vault..."
curl -s -X GET http://vault:${PORT_VAULT}/v1/secret/data/fav_places \
  --header "X-Vault-Token: $VAULT_TOKEN" \
  --output /tmp/fav_places_data

export DATABASE_URL=$(jq -r .data.data.database_url /tmp/fav_places_data)

rm -f /tmp/fav_places_data

echo "[fav-places] Running Prisma migrations..."
npx prisma migrate deploy

echo "[fav-places] Starting server on port ${PORT:-4002}..."
exec node src/server.js
