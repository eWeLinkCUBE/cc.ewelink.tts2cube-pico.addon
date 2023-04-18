import process from 'node:process';
import path from 'node:path';
import express from 'express';
import log from './middlewares/log';
import auth from './middlewares/auth';
import apiv1 from './controllers/api_v1';
import {
    SERVER_LISTEN_HOST,
    SERVER_LISTEN_PORT
} from './const';

const server = express();

server.use(log);
server.use(auth);
server.use(express.static(path.join(process.cwd(), 'public')));
server.use(apiv1);

server.listen(SERVER_LISTEN_PORT, SERVER_LISTEN_HOST, () => {
    console.log(`server running at 127.0.0.1:${SERVER_LISTEN_PORT}`);
});
