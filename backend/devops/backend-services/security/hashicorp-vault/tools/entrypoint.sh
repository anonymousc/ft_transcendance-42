#!/bin/sh

set -eu

sed -i  s/port/$PORT_VAULT/g /tools/config.hcl

export VAULT_ADDR="http://127.0.0.1:$PORT_VAULT"

vault server -dev -dev-root-token-id=$(cat /run/secrets/vault_key) -dev-listen-address=0.0.0.0:$PORT_VAULT&

VAULT_PID=$!

vault policy write postgres /tools/policy.hcl

vault token create -policy=postgres -format=json | grep

vault kv put -mount=secret postgres username=$(openssl rand -hex 123) password=$(openssl rand -hex 123)

wait $VAULT_PID