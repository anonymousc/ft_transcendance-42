#!/bin/sh

set -eu

echo asdasd > /tmp/test

rm -rf /var/lib/postgresql/data/*

initdb -U testing --pwfile=/tmp/test -A scram-sha-256

# npm install -g prisma @types/node @types/pg --save-dev

# npm install @prisma/client @prisma/adapter-pg pg dotenv

exec postgres -D /var/lib/postgresql/data

# exec sh