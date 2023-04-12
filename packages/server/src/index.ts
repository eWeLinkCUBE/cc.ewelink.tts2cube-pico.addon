import process from 'node:process';
import path from 'node:path';
import express from 'express';
import { host, port, hello } from './const';

const server = express();

server.use(express.static(path.join(process.cwd(), 'public')));

server.listen(port, host, () => {
    console.log(`server running at 127.0.0.1:${port}`);
});
