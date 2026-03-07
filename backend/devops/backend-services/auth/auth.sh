#!/bin/sh

set -eu 

echo "Auth microservice starting..."

# Wait for auth_token file to exist and be readable
echo "Waiting for vault token..."
while [ ! -r /data/auth_token ]; do
    sleep 2
done

VAULT_TOKEN=$(jq -r .auth.client_token < /data/auth_token)

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

rm -f /tmp/db_data

rm -f /tmp/backend_data

npx prisma generate

if [ $? -eq 0 ]; then
  npx prisma migrate deploy
fi

echo "Starting auth service on port ${AUTH_PORT:-3001}..."

exec npm run start