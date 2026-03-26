#!/bin/sh

set -eu

echo "[profiles-service] Starting..."

echo "[profiles-service] Waiting for /data/profiles_token..."
while [ ! -r /data/profiles_token ]; do
    sleep 2
done

VAULT_TOKEN=$(jq -r .auth.client_token < /data/profiles_token)

echo "[profiles-service] Fetching secrets from Vault..."
curl -s -X GET http://vault:${PORT_VAULT}/v1/secret/data/postgres \
  --header "X-Vault-Token: $VAULT_TOKEN" \
  --output /tmp/db_data

curl -s -X GET http://vault:${PORT_VAULT}/v1/secret/data/backend \
  --header "X-Vault-Token: $VAULT_TOKEN" \
  --output /tmp/backend_data

export DATABASE_URL=$(jq -r .data.data.database_url /tmp/db_data)
export JWT_ACCESS_SECRET=$(jq -r .data.data.jwt_access_secret /tmp/backend_data)
export JWT_ACCESS_EXPIRES_IN=$(jq -r .data.data.jwt_access_expires_in /tmp/backend_data)
export FRONTEND_URL=$(jq -r .data.data.frontend_url /tmp/backend_data)

rm -f /tmp/db_data /tmp/backend_data

echo "[profiles-service] Running Prisma migrations..."
npx prisma migrate deploy

echo "[profiles-service] Starting server on port ${PORT:-3002}..."
exec node dist/main
