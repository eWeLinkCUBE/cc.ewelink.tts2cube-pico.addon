FROM node:16.20.0-alpine

# TODO: CONFIG_DATA_PATH should be changed
ENV WDIR=/workspace/ewelink-cube-tts-addon \
    ENABLE_MIDDLEWARE_LOG=1 \
    ENABLE_MIDDLEWARE_AUTH=1 \
    CONFIG_DATA_PATH=${WDIR}/data

WORKDIR ${WDIR}

COPY . .

CMD ["node", "server/index.js"]
