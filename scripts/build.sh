#!/bin/bash

read -p "Build version: "
build_version=$REPLY

rm -rf build && mkdir build

npx lerna run build

cp -r packages/server/dist build/server

cp -r packages/web/dist build/public

cp docker/Dockerfile build

cat << EOF > ./build/buildinfo
BUILD_VERSION=$build_version
BUILD_DATE=$(date '+%F %T')
EOF
