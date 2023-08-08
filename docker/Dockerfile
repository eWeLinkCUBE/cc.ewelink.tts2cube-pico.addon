FROM node:16.20.0-alpine

ENV ENABLE_MIDDLEWARE_LOG=1 \
    ENABLE_MIDDLEWARE_AUTH=1 \
    ENABLE_PRINT_BUILDINFO=1 \
    CONFIG_CUBE_HOSTNAME=ihost \
    CONFIG_AUDIO_DATA_PATH=/data \
    CONFIG_TOKEN_DATA_PATH=/data \
    LOG_LEVEL=info \
    APP_NAME="TTS2CUBE-Pico"

WORKDIR /workspace/ewelink-cube-tts-addon

RUN apk add ffmpeg
RUN apk add picotts --repository=http://dl-cdn.alpinelinux.org/alpine/edge/testing/

COPY . .

CMD ["node", "server/index.js"]
