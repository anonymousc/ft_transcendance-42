#!/bin/sh

set -eu

echo "Starting maptoposter service..."

until nc -z ${REDIS_HOST:-redis} ${REDIS_PORT:-6379} 2>/dev/null; do
    echo "Waiting for Redis at ${REDIS_HOST:-redis}:${REDIS_PORT:-6379}..."
    sleep 2
done

echo "Redis is available"

if [ -f /data/frontend_token ]; then
    VAULT_TOKEN=$(jq -r .auth.client_token < /data/frontend_token)
    
    curl -s -X GET "http://vault:${PORT_VAULT}/v1/secret/data/redis" \
      --header "X-Vault-Token: $VAULT_TOKEN" \
      --output /tmp/redis_data
    
    export REDIS_PASSWORD=$(jq -r .data.data.password /tmp/redis_data)
    export REDIS_URL=$(jq -r .data.data.url /tmp/redis_data)
    export REDIS_HOST=$(jq -r .data.data.host /tmp/redis_data)
    export REDIS_PORT=$(jq -r .data.data.port /tmp/redis_data)
    
    rm -f /tmp/redis_data
    echo "Redis credentials loaded from Vault"
else
    echo "Warning: No Vault token found, using environment variables"
fi

# Export Redis connection for the application
export REDIS_URL="${REDIS_URL:-redis://:${REDIS_PASSWORD}@${REDIS_HOST:-redis}:${REDIS_PORT:-6379}}"

echo "Maptoposter starting on port 5025..."

# Start the maptoposter application (Python Flask)
exec python3 app.py
