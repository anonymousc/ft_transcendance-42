#!/bin/sh

set -eu

echo "[review-places] Starting..."

# Wait for Vault token written by the vault container
echo "[review-places] Waiting for /data/reviews_token..."
while [ ! -r /data/reviews_token ]; do
    sleep 2
done

VAULT_TOKEN=$(jq -r .auth.client_token < /data/reviews_token)

echo "[review-places] Fetching database credentials from Vault..."
curl -s -X GET http://vault:${PORT_VAULT}/v1/secret/data/reviews \
  --header "X-Vault-Token: $VAULT_TOKEN" \
  --output /tmp/reviews_data

export DATABASE_URL=$(jq -r .data.data.database_url /tmp/reviews_data)

rm -f /tmp/reviews_data

echo "[review-places] Running Prisma migrations..."
npx prisma migrate deploy

echo "[review-places] Starting server on port ${PORT:-4001}..."
exec node src/server.js
