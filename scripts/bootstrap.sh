#!/bin/bash

npm install

cat << EOF > ./packages/server/.env
ENABLE_MIDDLEWARE_LOG=1
ENABLE_MIDDLEWARE_AUTH=1
EOF
