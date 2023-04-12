#!/bin/bash

rm -rf build && mkdir build

npx lerna run build

cp -r packages/server/dist build/server

cp -r packages/web/dist build/public

cp docker/Dockerfile build
