FROM node:16.20.0-alpine

# TODO: CONFIG_DATA_PATH should be changed
ENV WDIR=/workspace/ewelink-cube-tts-addon \
    CONFIG_DATA_PATH=${WDIR}/data

WORKDIR ${WDIR}

COPY . .

CMD ["node", "server/index.js"]
