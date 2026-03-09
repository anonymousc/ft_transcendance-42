#!/bin/sh

set -eu 

VAULT_TOKEN=$(jq -r .auth.client_token < /data/token)

curl -s -X GET http://vault:$PORT_VAULT/v1/secret/data/postgres \
  --header "X-Vault-Token: $VAULT_TOKEN" \
  --output /tmp/db_data

curl -s -X GET http://vault:$PORT_VAULT/v1/secret/data/backend \
  --header "X-Vault-Token: $VAULT_TOKEN" \
  --output /tmp/backend_data

export DATABASE_URL=$(jq -r .data.data.database_url /tmp/db_data)

export FRONTEND_URL=$(jq -r .data.data.frontend_url /tmp/backend_data)
export GOOGLE_CLIENT_ID=$(jq -r .data.data.google_client_id /tmp/backend_data)
export GOOGLE_CLIENT_SECRET=$(jq -r .data.data.google_client_secret /tmp/backend_data)
export GOOGLE_CALLBACK_URL=$(jq -r .data.data.google_callback_url /tmp/backend_data)
export JWT_ACCESS_SECRET=$(jq -r .data.data.jwt_access_secret /tmp/backend_data)
export JWT_REFRESH_SECRET=$(jq -r .data.data.jwt_refresh_secret /tmp/backend_data)
export JWT_ACCESS_EXPIRES_IN=$(jq -r .data.data.jwt_access_expires_in /tmp/backend_data)
export JWT_REFRESH_EXPIRES_IN=$(jq -r .data.data.jwt_refresh_expires_in /tmp/backend_data)

rm -f /tmp/db_data /tmp/backend_data

npx prisma generate

sleep 5

# Use db push if no migrations exist, otherwise use migrate deploy
if [ -z "$(ls -A prisma/migrations 2>/dev/null | grep -v migration_lock.toml)" ]; then
    echo "No migrations found, using prisma db push..."
    npx prisma db push --accept-data-loss
else
    npx prisma migrate deploy
fi

exec npm run start:dev