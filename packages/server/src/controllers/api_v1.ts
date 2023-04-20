import express from 'express';
import logger from '../logger';
import {
    getCubeBridgeAt,
    getCubeDeviceList,
    getCubeTtsEngineList,
    registerCubeTtsEngine
} from '../api/cube';
import { getCubeToken } from '../store/token';
import {
    ERR_SUCCESS,
    ERR_SERVER_INTERNAL
} from '../error';

const apiv1 = express.Router();

// Get server information
apiv1.get('/api/v1/get-server-info', async (req, res) => {
    const result = {
        error: 0,
        data: {
            cubeTokenValid: false
        },
        msg: 'Success'
    };

    result.data.cubeTokenValid = true;
    res.send(result);
    return;

    try {
        // 1. Check token existence.
        const token = await getCubeToken();
        if (!token) {
            console.warn('no token');
            res.send(result);
            return;
        }

        // 2. Check token validation.
        const devListRes = await getCubeDeviceList();
        if (devListRes.error !== ERR_SUCCESS) {
            console.warn('token unvalid');
            res.send(result);
            return;
        }

        result.data.cubeTokenValid = true;
        res.send(result);
        return;
    } catch (err) {
        console.error(err);
        result.error = ERR_SERVER_INTERNAL;
        result.msg = 'Server error'
        res.send(result);
        return;
    }
});

// Get eWeLink Cube token
apiv1.get('/api/v1/get-cube-token', async (req, res) => {
    const result = {
        error: 0,
        data: {},
        msg: 'Success'
    };

    try {
        // 1. Call getBridgeAt API.
        const atRes = await getCubeBridgeAt();
        if (atRes.error !== ERR_SUCCESS) {
            console.warn('get at failed');
            res.send(result);
            return;
        }

        // 2. Check TTS engine register status.
        const engineRes = await getCubeTtsEngineList();
        if (engineRes.error !== ERR_SUCCESS) {
            console.warn('get list failed');
            res.send(result);
            return;
        }

        // 3. If no register, then do it.
        // TODO: check register status
        const regRes = await registerCubeTtsEngine();
        if (regRes.error !== ERR_SUCCESS) {
            console.warn('reg failed');
            res.send(result);
            return;
        }

        res.send(result);
        return;
    } catch (err) {
        console.error(err);
        result.error = ERR_SERVER_INTERNAL;
        result.msg = 'Server error';
        res.send(result);
        return;
    }
});

// Get audio list
apiv1.get('/api/v1/audio/list', (req, res) => {
    // TODO: read audio list data from keyv store.

    // mock data
    const result = [
        {
            key: 0,
            id: '94e48afb-6848-41ba-bf77-ef8ecdbe47e8',
            filename: 'audio1.mp3',
            text: 'super power',
            config: 'English',
            time: '2022/04/17',
            url: 'http://127.0.0.1:8080/_audio/audio1.mp3'
        },
        {
            key: 1,
            id: '59fb5537-3bcf-4c3b-8e3a-a444adecacd8',
            filename: 'audio2.mp3',
            text: 'test audio',
            config: 'English',
            time: '2023/01/02',
            url: 'http://127.0.0.1:8080/_audio/audio2.mp3'
        },
        {
            key: 2,
            id: 'f5370cd3-9100-4887-a470-0265dff334fa',
            filename: 'audio3.mp3',
            text: 'hello world',
            config: 'English',
            time: '2023/04/02',
            url: 'http://127.0.0.1:8080/_audio/audio3.mp3'
        }
    ];

    // logger.info('get audio list');
    res.send({ error: 0, data: { audioList: result }, msg: 'Success' });
    return;
});

// Remove an audio list item
apiv1.delete('/api/v1/audio', (req, res) => {
    logger.info('remove audio list item');
    res.send('remove audio item');
});

// Update an audio list item
apiv1.put('/api/v1/audio', (req, res) => {
    logger.info('update audio list item');
    res.send('update audio item');
});

export default apiv1;
