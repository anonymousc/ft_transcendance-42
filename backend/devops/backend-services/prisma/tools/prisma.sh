#!/bin/sh

set -eu

if [ -f /var/lib/postgresql/18/docker/PG_VERSION ]; then
    echo "PostgreSQL data directory already initialized"
else

    curl -X GET http://vault:6666/v1/secret/data/postgres --header "X-Vault-Token: $(jq -r .auth.client_token < /token/token)" --silent --output /token/data

    jq -r .data.data.password < /token/data > /token/passfile

    export PGPORT=$PORT_POSTGRES

    initdb -U $(jq -r .data.data.username < /token/data) --pwfile=/token/passfile -A scram-sha-256 

    sed -i -e "s/#port = 5432/port = $PORT_POSTGRES/g" $PGDATA/postgresql.conf
    sed -i -e "s|#log_directory = 'log'|log_directory = '/var/logs/'|g" $PGDATA/postgresql.conf
    sed -i -e "s/#logging_collector = off/logging_collector = on/g" $PGDATA/postgresql.conf
    sed -i -e "s/#log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'/log_filename = 'postgresql.log'/g" $PGDATA/postgresql.conf
    sed -i -e "s/#log_line_prefix = '%m \[%p\] '/log_line_prefix = '%m [%p] %q%u@%d '/g" $PGDATA/postgresql.conf

    rm -rf /token/passfile

    pg_ctl  -o "-p $PGPORT -c listen_addresses='*'" start 

    echo "host all all 0.0.0.0/0 scram-sha-256" >> /var/lib/postgresql/18/docker/pg_hba.conf

    export PGPASSWORD=$(jq -r .data.data.password < /token/data)
    createdb -U $(jq -r .data.data.username < /token/data) prisma 

    DB_USER=$(jq -r .data.data.username < /token/data)
    RAW_PASS=$(jq -r .data.data.password < /token/data)

    export DATABASE_URL=$(jq -r .data.data.database_url < /token/data)

    pg_ctl reload

    pg_ctl stop

    rm -rf /token/data 
fi

exec postgres