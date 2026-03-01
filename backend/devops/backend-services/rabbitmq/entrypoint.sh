#!/bin/sh

set -eu

echo "Starting RabbitMQ setup..."

# Wait for Vault token to be available
until [ -f /vault/token ]; do
    echo "Waiting for Vault token at /vault/token..."
    sleep 2
done

VAULT_TOKEN=$(jq -r .auth.client_token < /vault/token)

# Fetch RabbitMQ credentials from Vault
echo "Fetching RabbitMQ credentials from Vault..."
curl -s -X GET "http://vault:${PORT_VAULT}/v1/secret/data/rabbitmq" \
  --header "X-Vault-Token: $VAULT_TOKEN" \
  --output /tmp/rabbitmq_data

RABBITMQ_USER=$(jq -r .data.data.username /tmp/rabbitmq_data)
RABBITMQ_PASS=$(jq -r .data.data.password /tmp/rabbitmq_data)

# Clean up temp file
rm -f /tmp/rabbitmq_data

# Export environment variables for RabbitMQ
export RABBITMQ_DEFAULT_USER="$RABBITMQ_USER"
export RABBITMQ_DEFAULT_PASS="$RABBITMQ_PASS"

# Ensure proper permissions for rabbitmq user
chown -R rabbitmq:rabbitmq /var/lib/rabbitmq

echo "RabbitMQ configured with user: $RABBITMQ_USER"
echo "Starting RabbitMQ server..."

# Start RabbitMQ as rabbitmq user using the official entrypoint
exec su-exec rabbitmq docker-entrypoint.sh rabbitmq-server
