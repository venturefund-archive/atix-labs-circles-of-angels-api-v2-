#!/bin/bash

psql -U postgres -a -f /docker-entrypoint-initdb.d/db/scripts/create_database.sql

psql -U atixlabs -d coadb -a -f /docker-entrypoint-initdb.d/db/scripts/schema.sql

psql -U atixlabs -d coadb < /docker-entrypoint-initdb.d/db/coa-dump.sql