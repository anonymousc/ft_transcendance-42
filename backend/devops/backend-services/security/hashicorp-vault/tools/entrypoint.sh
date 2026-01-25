#!/bin/sh

set -eu

export VAULT_ADDR="http://0.0.0.0:$PORT_VAULT"

vault server -dev -dev-root-token-id=$(openssl rand -hex 10) -dev-listen-address=0.0.0.0:$PORT_VAULT&

VAULT_PID=$!

sleep 30s

vault policy write postgres /tools/policy.hcl

vault token create -policy=postgres -format=json > /shared/token

vault kv put -mount=secret postgres username=$(openssl rand -hex 123) password=$(openssl rand -hex 123)

wait $VAULT_PID