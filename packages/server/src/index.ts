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

// TODO: for demo version.
// --------------------------------
import { setAudioList } from './store/audio';
const mockData = [
    {
        id: '94e48afb-6848-41ba-bf77-ef8ecdbe47e8',
        filename: 'audio1.mp3',
        text: 'hello, world',
        config: 'English',
        createdAt: 1639267200000
    },
    {
        id: '59fb5537-3bcf-4c3b-8e3a-a444adecacd8',
        filename: 'audio2.mp3',
        text: 'tts addon',
        config: 'English',
        createdAt: 1680480000000
    },
    {
        id: 'f5370cd3-9100-4887-a470-0265dff334fa',
        filename: 'audio3.mp3',
        text: 'well done',
        config: 'English',
        createdAt: 1662336000000
    }
];
setAudioList(mockData);
// --------------------------------

const server = express();

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

// Init eWeLink Cube API.
initCubeApi();

server.listen(SERVER_LISTEN_PORT, SERVER_LISTEN_HOST, () => {
    logger.info(`Server listen at port ${SERVER_LISTEN_PORT}`);
});
