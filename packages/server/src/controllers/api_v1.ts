import express from 'express';
import logger from '../logger';

const apiv1 = express.Router();

// Get server information
apiv1.get('/api/v1/get-server-info', (req, res) => {
    const result = {
        cubeTokenValid: true
    };
    res.send({ error: 0, data: result, msg: 'Success' });
    return;
});

// Get eWeLink Cube token
apiv1.get('/api/v1/get-cube-token', (req, res) => {
    logger.info('get cube token');
    res.send('hello cube token');
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
