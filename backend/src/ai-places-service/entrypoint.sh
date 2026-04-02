#!/bin/sh

set -eu

echo "[places-service] Starting..."
while [ ! -r /data/profiles_token ]; do
    sleep 2
done

VAULT_TOKEN=$(jq -r .auth.client_token < /data/profiles_token)

echo "[places-service] Fetching secrets from Vault..."
curl -s -X GET http://vault:${PORT_VAULT}/v1/secret/data/fav_places \
  --header "X-Vault-Token: $VAULT_TOKEN" \
  --output /tmp/fav_places

curl -s -X GET http://vault:${PORT_VAULT}/v1/secret/data/auth \
  --header "X-Vault-Token: $VAULT_TOKEN" \
  --output /tmp/auth_data

export GOOGLE_PLACES_API_KEY=$(jq -r .data.data.api_key /tmp/fav_places)
export JWT_ACCESS_SECRET=$(jq -r .data.data.jwt_access_secret /tmp/auth_data)
export FRONTEND_URL=$(jq -r .data.data.frontend_url /tmp/auth_data)

rm -f /tmp/fav_places /tmp/auth_data

echo "[places-service] Starting server on port ${PORT:-4000}..."
exec node src/server.js
