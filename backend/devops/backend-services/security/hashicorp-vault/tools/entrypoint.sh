#!/bin/sh

set -eu

export VAULT_ADDR="http://0.0.0.0:$PORT_VAULT"

vault server -dev -dev-root-token-id=$(openssl rand -hex 10) -dev-listen-address=0.0.0.0:$PORT_VAULT > /dev/null 2>&1 &

VAULT_PID=$!

until curl $VAULT_ADDR --silent --output /dev/null ; do
    echo "vault is running"
    sleep 3s
done

vault policy write postgres /tools/policy.hcl > /dev/null 

DB_PASS=$(openssl rand -hex 12)
DB_USER=$(openssl rand -hex 12)

DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@database:${PORT_POSTGRES}/prisma?schema=public"

vault kv put -mount=secret postgres username="$DB_USER" password="$DB_PASS" database_url="$DATABASE_URL" > /dev/null

JWT_ACCESS_SECRET=$(openssl rand -hex 64)
JWT_REFRESH_SECRET=$(openssl rand -hex 64)
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=$(cat /secrets/google_client_id 2>/dev/null || echo "")
GOOGLE_CLIENT_SECRET=$(cat /secrets/google_client_secret 2>/dev/null || echo "")
GOOGLE_CALLBACK_URL=$(cat /secrets/callback_url 2>/dev/null || echo "")
FRONTEND_URL=$(cat /secrets/frontend_url 2>/dev/null || echo "")

vault kv put -mount=secret backend \
    jwt_access_secret="$JWT_ACCESS_SECRET" \
    jwt_refresh_secret="$JWT_REFRESH_SECRET" \
    jwt_access_expires_in="$JWT_ACCESS_EXPIRES_IN" \
    jwt_refresh_expires_in="$JWT_REFRESH_EXPIRES_IN" \
    google_client_id="$GOOGLE_CLIENT_ID" \
    google_client_secret="$GOOGLE_CLIENT_SECRET" \
    google_callback_url="$GOOGLE_CALLBACK_URL" \
    frontend_url="$FRONTEND_URL" \
    database_url="$DATABASE_URL" > /dev/null

vault token create -policy=postgres -format=json > /shared/token

vault token create -policy=postgres -format=json > /shared/backend_token

if [ -f /shared/token ];then
    chown 70:70 /shared/ && chown 70:70 /shared/token
    chmod 600 /shared/token
fi

if [ -f /shared/backend_token ];then
    chmod 600 /shared/backend_token
fi

wait $VAULT_PID
