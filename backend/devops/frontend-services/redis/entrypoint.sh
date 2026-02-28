#!/bin/sh

set -eu

VAULT_TOKEN=$(jq -r .auth.client_token < /vault/frontend_token)

curl -s -X GET http://vault:${PORT_VAULT}/v1/secret/data/redis \
  --header "X-Vault-Token: $VAULT_TOKEN" \
  --output /tmp/redis_data

REDIS_PASSWORD=$(jq -r .data.data.password /tmp/redis_data)

rm -f /tmp/redis_data

exec redis-server --requirepass "$REDIS_PASSWORD"
