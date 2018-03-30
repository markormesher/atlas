#!/usr/bin/env bash

./wait-for-it/wait-for-it.sh postgres:5432 --timeout=30 --strict &
waitForPostgres=$!

wait ${waitForPostgres}

exec node ./src/app.js
