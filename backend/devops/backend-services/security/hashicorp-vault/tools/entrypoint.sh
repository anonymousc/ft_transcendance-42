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

vault token create -policy=postgres -format=json > /shared/token

vault kv put -mount=secret postgres username=$(openssl rand -hex 12) password=$(openssl rand -hex 12) > /dev/null

if [ -f /shared/token ];then
    chown 70:70 /shared/ && chown 70:70 /shared/token
    chmod 600 /shared/token
fi

wait $VAULT_PID
