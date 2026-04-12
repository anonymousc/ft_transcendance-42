#!/bin/sh

set -eu

echo "[auth-service] Starting..."

echo "[auth-service] Waiting for /data/auth_token..."
while [ ! -r /data/auth_token ]; do
    sleep 2
done

VAULT_TOKEN=$(jq -r .auth.client_token < /data/auth_token)

echo "[auth-service] Fetching secrets from Vault..."
curl -s -X GET http://vault:${PORT_VAULT}/v1/secret/data/postgres \
  --header "X-Vault-Token: $VAULT_TOKEN" \
  --output /tmp/db_data

curl -s -X GET http://vault:${PORT_VAULT}/v1/secret/data/auth \
  --header "X-Vault-Token: $VAULT_TOKEN" \
  --output /tmp/auth_data

export DATABASE_URL=$(jq -r .data.data.database_url /tmp/db_data)

export FRONTEND_URL=$(jq -r .data.data.frontend_url /tmp/auth_data)
export GOOGLE_CLIENT_ID=$(jq -r .data.data.google_client_id /tmp/auth_data)
export GOOGLE_CLIENT_SECRET=$(jq -r .data.data.google_client_secret /tmp/auth_data)
export GOOGLE_CALLBACK_URL=$(jq -r .data.data.google_callback_url /tmp/auth_data)
export FORTYTWO_CLIENT_ID=$(jq -r .data.data.fortytwo_client_id /tmp/auth_data)
export FORTYTWO_CLIENT_SECRET=$(jq -r .data.data.fortytwo_client_secret /tmp/auth_data)
export FORTYTWO_CALLBACK_URL=$(jq -r .data.data.fortytwo_callback_url /tmp/auth_data)
export JWT_ACCESS_SECRET=$(jq -r .data.data.jwt_access_secret /tmp/auth_data)
export JWT_REFRESH_SECRET=$(jq -r .data.data.jwt_refresh_secret /tmp/auth_data)
export JWT_ACCESS_EXPIRES_IN=$(jq -r .data.data.jwt_access_expires_in /tmp/auth_data)
export JWT_REFRESH_EXPIRES_IN=$(jq -r .data.data.jwt_refresh_expires_in /tmp/auth_data)


rm -f /tmp/db_data /tmp/auth_data

echo "[auth-service] Running Prisma migrations..."
npx prisma migrate deploy

echo "[auth-service] Starting server on port ${AUTH_PORT:-3001}..."
exec node dist/main
