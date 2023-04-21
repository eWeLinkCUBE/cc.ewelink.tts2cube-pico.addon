import process from 'node:process';
import path from 'node:path';
import express from 'express';
import log from './middlewares/log';
import auth from './middlewares/auth';
import apiv1 from './controllers/api_v1';
import logger from './logger';
import {
    SERVER_LISTEN_HOST,
    SERVER_LISTEN_PORT,
    AUDIO_FILES_DIR
} from './const';
import { initCubeApi } from './api/cube';
import { initAudioStore } from './store/audio';

const server = express();

// Init eWeLink Cube API.
initCubeApi();

// Init audio store.
initAudioStore();

// Enable log middleware.
if (process.env.ENABLE_MIDDLEWARE_LOG === '1') {
    server.use(log);
}

// Enable auth middleware.
if (process.env.ENABLE_MIDDLEWARE_AUTH === '1') {
    server.use(auth);
}

// Serve web static files.
server.use(express.static(path.join(process.cwd(), 'public')));

// Serve audio static files.
server.use('/_audio', express.static(path.join(process.env.CONFIG_DATA_PATH as string, AUDIO_FILES_DIR)));

server.use(express.json());
server.use(apiv1);

server.listen(SERVER_LISTEN_PORT, SERVER_LISTEN_HOST, () => {
    logger.info(`Server listen at port ${SERVER_LISTEN_PORT}`);
});
