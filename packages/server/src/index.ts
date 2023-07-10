import process from 'node:process';
import path from 'node:path';
import { execSync } from 'node:child_process';
import express from 'express';
import log from './middlewares/log';
import auth from './middlewares/auth';
import apiv1 from './controllers/api_v1';
import logger from './logger';
import {
    SERVER_LISTEN_HOST,
    SERVER_LISTEN_PORT,
} from './const';
import { initCubeApi } from './api/cube';
import { initAudioStore } from './store/audio';
import { printBuildinfo } from './utils/welcome';
import { getAudioCacheFilesDir, getAudioFilesDir } from './utils/etc';

logger.info('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ START @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');

const {
    ENABLE_PRINT_BUILDINFO,
    ENABLE_MIDDLEWARE_LOG,
    ENABLE_MIDDLEWARE_AUTH,
} = process.env;

// Enable print build info.
if (ENABLE_PRINT_BUILDINFO === '1') {
    printBuildinfo();
}

// Init eWeLink Cube API.
initCubeApi();

// Init audio store.
initAudioStore();

const server = express();
server.use(express.json());

// Enable log middleware.
if (ENABLE_MIDDLEWARE_LOG === '1') {
    server.use(log);
}

// Enable auth middleware.
if (ENABLE_MIDDLEWARE_AUTH === '1') {
    server.use(auth);
}

// Serve web static files.
server.use(express.static(path.join(process.cwd(), 'public')));

// Serve audio static files.
server.use('/_audio', express.static(getAudioFilesDir()));

server.use(apiv1);

server.listen(SERVER_LISTEN_PORT, SERVER_LISTEN_HOST, () => {
    logger.info(`Server listen at port ${SERVER_LISTEN_PORT}`);

    // Init audio files dir
    const audioDir = getAudioFilesDir();
    execSync(`mkdir -p ${audioDir}`);

    // Init audio cache files dir
    const audioCacheDir = getAudioCacheFilesDir();
    execSync(`rm -rf ${audioCacheDir} && mkdir ${audioCacheDir}`);

    // TODO: start sched(remove audio cache files)
});

// Log signal
process.on('SIGTERM', () => {
    logger.info('................................ GOT SIGTERM ................................');
    process.exit(0);
});
