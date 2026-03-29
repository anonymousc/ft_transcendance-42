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

export GOOGLE_PLACES_API_KEY=$(jq -r .data.data.api_key /tmp/fav_places)

rm -f  /tmp/fav_places

echo "[places-service] Starting server on port ${PORT:-4000}..."
exec node src/server.js
