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

# Postgres is only initialized once (see prisma.sh). Vault dev mode resets KV on restart.
# Reuse credentials stored on the shared volume so KV and the running cluster stay aligned.
CREDS_FILE=/shared/postgres_db_credentials
if [ -f "$CREDS_FILE" ]; then
    DB_USER=$(sed -n '1p' "$CREDS_FILE")
    DB_PASS=$(sed -n '2p' "$CREDS_FILE")
else
    DB_PASS=$(openssl rand -hex 12)
    DB_USER=$(openssl rand -hex 12)
    printf '%s\n%s\n' "$DB_USER" "$DB_PASS" > "$CREDS_FILE"
    chmod 600 "$CREDS_FILE"
fi
export DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@database:${PORT_POSTGRES}/prisma?schema=public"

vault kv put -mount=secret postgres username="$DB_USER" password="$DB_PASS" database_url="$DATABASE_URL" > /dev/null

REVIEWS_DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@database:${PORT_POSTGRES}/reviews?schema=public"
vault kv put -mount=secret reviews database_url="$REVIEWS_DATABASE_URL" > /dev/null

PLACES=$(cat /run/secrets/google_places_api_key)
FAV_PLACES_DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@database:${PORT_POSTGRES}/fav_places?schema=public"
vault kv put -mount=secret fav_places database_url="$FAV_PLACES_DATABASE_URL" api_key="$PLACES" > /dev/null

FRIENDS_DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@database:${PORT_POSTGRES}/friends?schema=public"
vault kv put -mount=secret friends database_url="$FRIENDS_DATABASE_URL" > /dev/null

JWT_ACCESS_SECRET=$(openssl rand -hex 64)
JWT_REFRESH_SECRET=$(openssl rand -hex 64)
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=$(cat /run/secrets/google_client_id 2>/dev/null || echo "")
GOOGLE_CLIENT_SECRET=$(cat /run/secrets/google_client_secret 2>/dev/null || echo "")
GOOGLE_CALLBACK_URL=$(cat /run/secrets/callback_url 2>/dev/null || echo "")
FRONTEND_URL=$(cat /run/secrets/frontend_url 2>/dev/null || echo "")

GEMINI_API_KEY=$(cat /run/secrets/gemini_api_key)
vault kv put -mount=secret planner api_key="$GEMINI_API_KEY" url_db="$DATABASE_URL"

vault kv put -mount=secret auth \
    jwt_access_secret="$JWT_ACCESS_SECRET" \
    jwt_refresh_secret="$JWT_REFRESH_SECRET" \
    jwt_access_expires_in="$JWT_ACCESS_EXPIRES_IN" \
    jwt_refresh_expires_in="$JWT_REFRESH_EXPIRES_IN" \
    google_client_id="$GOOGLE_CLIENT_ID" \
    google_client_secret="$GOOGLE_CLIENT_SECRET" \
    google_callback_url="$GOOGLE_CALLBACK_URL" \
    frontend_url="$FRONTEND_URL" \
    database_url="$DATABASE_URL" > /dev/null

REDIS_PASSWORD=$(openssl rand -hex 16)
REDIS_HOST=${REDIS_HOST:-redis}
REDIS_PORT=${REDIS_PORT:-6379}

vault kv put -mount=secret redis \
    password="$REDIS_PASSWORD" \
    host="$REDIS_HOST" \
    port="$REDIS_PORT" \
    url="redis://:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}" > /dev/null

vault token create -policy=postgres -format=json > /shared/token

vault token create -policy=postgres -format=json > /shared/frontend_token

vault token create -policy=postgres -format=json > /shared/auth_token

vault token create -policy=postgres -format=json > /shared/reviews_token

vault token create -policy=postgres -format=json > /shared/fav_places_token

vault token create -policy=postgres -format=json > /shared/friends_token

vault token create -policy=planner -format=json > /shared/planner

vault token create -policy=postgres -format=json > /shared/profiles_token

if [ -f /shared/token ];then
    chown 70:70 /shared/ && chown 70:70 /shared/token
    chmod 600 /shared/token
fi

if [ -f /shared/backend_token ];then
    chmod 600 /shared/backend_token
fi

if [ -f /shared/frontend_token ];then
    chmod 644 /shared/frontend_token
fi

if [ -f /shared/auth_token ];then
    chmod 644 /shared/auth_token
fi

if [ -f /shared/reviews_token ];then
    chmod 644 /shared/reviews_token
fi

if [ -f /shared/fav_places_token ];then
    chmod 644 /shared/fav_places_token
fi

if [ -f /shared/friends_token ];then
    chmod 644 /shared/friends_token
fi

if [ -f /shared/profiles_token ];then
    chmod 644 /shared/profiles_token
fi

wait $VAULT_PID
