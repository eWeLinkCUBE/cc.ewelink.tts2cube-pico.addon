import express from 'express';
import logger from '../logger';

const apiv1 = express.Router();

// Get server information
apiv1.get('/api/v1/get-server-info', (req, res) => {
    logger.info('get server info');
    res.send('hello server info');
});

// Get eWeLink Cube token
apiv1.get('/api/v1/get-cube-token', (req, res) => {
    logger.info('get cube token');
    res.send('hello cube token');
});

// Get audio list
apiv1.get('/api/v1/audio/list', (req, res) => {
    logger.info('get audio list');
    res.send('hello audio list');
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
