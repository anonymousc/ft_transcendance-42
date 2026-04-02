#!/bin/sh

set -eu

echo "[planner] Starting..."

echo "[planner] Waiting for /data/profiles_token..."
while [ ! -r /data/profiles_token ]; do
    sleep 2
done

VAULT_TOKEN=$(jq -r .auth.client_token < /data/profiles_token)
echo $VAULT_TOKEN

echo "[planner] Fetching secrets from Vault..."

curl -s -X GET http://vault:${PORT_VAULT}/v1/secret/data/postgres \
  --header "X-Vault-Token: $VAULT_TOKEN" \
  --output /tmp/db_data
curl -s -X GET http://vault:${PORT_VAULT}/v1/secret/data/planner \
  --header "X-Vault-Token: $VAULT_TOKEN" \
  --output /tmp/planner
curl -s -X GET http://vault:${PORT_VAULT}/v1/secret/data/auth \
  --header "X-Vault-Token: $VAULT_TOKEN" \
  --output /tmp/auth_data
curl -s -X GET http://vault:${PORT_VAULT}/v1/secret/data/fav_places \
  --header "X-Vault-Token: $VAULT_TOKEN" \
  --output /tmp/fav_places

export DATABASE_URL=$(jq -r .data.data.database_url /tmp/db_data)
export FRONTEND_URL=$(jq -r .data.data.frontend_url /tmp/auth_data)
export GOOGLE_CLIENT_ID=$(jq -r .data.data.google_client_id /tmp/auth_data)
export GOOGLE_CLIENT_SECRET=$(jq -r .data.data.google_client_secret /tmp/auth_data)
export GOOGLE_PLACES_API_KEY=$(jq -r .data.data.api_key /tmp/fav_places)
export JWT_ACCESS_SECRET=$(jq -r .data.data.jwt_access_secret /tmp/auth_data)
export GEMINI_API_KEY=$(jq -r .data.data.api_key /tmp/planner)

rm -f /tmp/db_data /tmp/planner /tmp/auth_data /tmp/fav_places

echo "[planner] Running Prisma migrations..."
npx prisma migrate deploy

exec node src/server.js
