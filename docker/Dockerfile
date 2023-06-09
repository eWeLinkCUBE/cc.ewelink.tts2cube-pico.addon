FROM node:16.20.0-alpine

ENV ENABLE_MIDDLEWARE_LOG=1 \
    ENABLE_MIDDLEWARE_AUTH=1 \
    ENABLE_PRINT_BUILDINFO=1 \
    CONFIG_CUBE_HOSTNAME=ihost \
    # for demo version
    CONFIG_AUDIO_DATA_PATH=/workspace/ewelink-cube-tts-addon \
    CONFIG_TOKEN_DATA_PATH=/data \
    LOG_LEVEL=info \
    APP_NAME="TTS API test"

WORKDIR /workspace/ewelink-cube-tts-addon

COPY . .

CMD ["node", "server/index.js"]
