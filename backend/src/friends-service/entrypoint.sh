#!/bin/sh

set -eu

echo "[friends-service] Starting..."

echo "[friends-service] Waiting for /data/friends_token..."
while [ ! -r /data/friends_token ]; do
    sleep 2
done

VAULT_TOKEN=$(jq -r .auth.client_token < /data/friends_token)

echo "[friends-service] Fetching database credentials from Vault..."
curl -s -X GET "http://vault:${PORT_VAULT}/v1/secret/data/friends" \
  --header "X-Vault-Token: $VAULT_TOKEN" \
  --output /tmp/friends_data

curl -s -X GET "http://vault:${PORT_VAULT}/v1/secret/data/auth" \
  --header "X-Vault-Token: $VAULT_TOKEN" \
  --output /tmp/auth_data

export DATABASE_URL=$(jq -r .data.data.database_url /tmp/friends_data)
export JWT_ACCESS_SECRET=$(jq -r .data.data.jwt_access_secret /tmp/auth_data)
export FRONTEND_URL=$(jq -r .data.data.frontend_url /tmp/auth_data)

rm -f /tmp/friends_data /tmp/auth_data

echo "[friends-service] Running Prisma migrations..."
npx prisma migrate deploy

echo "[friends-service] Starting server on port ${PORT:-4003}..."
exec node src/server.js