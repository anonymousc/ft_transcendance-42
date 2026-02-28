#!/bin/sh

set -eu 

curl -s -X GET http://vault:$PORT_VAULT/v1/secret/data/postgres \
  --header "X-Vault-Token: $(jq -r .auth.client_token < /data/token)" \
  --output /tmp/data

export DATABASE_URL=$(jq -r .data.data.database_url /tmp/data)

rm -f /tmp/data

exec node