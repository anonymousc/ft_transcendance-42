#!/bin/sh

set -eu

echo "Starting Redis setup..."

# Wait for Vault token to be available
until [ -f /vault/frontend_token ]; do
    echo "Waiting for Vault frontend token at /vault/frontend_token..."
    sleep 2
done

VAULT_TOKEN=$(jq -r .auth.client_token < /vault/frontend_token)

echo "Fetching Redis credentials from Vault..."
curl -s -X GET http://vault:${PORT_VAULT}/v1/secret/data/redis \
  --header "X-Vault-Token: $VAULT_TOKEN" \
  --output /tmp/redis_data

REDIS_PASSWORD=$(jq -r .data.data.password /tmp/redis_data)

rm -f /tmp/redis_data

echo "Starting Redis server..."
exec redis-server --requirepass "$REDIS_PASSWORD"
