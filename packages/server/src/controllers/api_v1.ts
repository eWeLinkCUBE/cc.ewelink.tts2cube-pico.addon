import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import express from 'express';
import _ from 'lodash';
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
    ERR_SERVER_INTERNAL,
    ERR_NO_AUDIO_ID,
    ERR_AUDIO_NOT_FOUND,
    ERR_NO_AUDIO_FILENAME
} from '../error';
import { AUDIO_FILES_DIR } from '../const';
import { getAudioList, setAudioList } from '../store/audio';

type ApiGetAudioListItem = {
    key: number;
    id: string;
    filename: string;
    text: string;
    config: string;
    time: string;
    url: string;
};

const apiv1 = express.Router();

// Get server information
apiv1.get('/api/v1/get-server-info', async (req, res) => {
    logger.info('get server info');

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
apiv1.get('/api/v1/audio/list', async (req, res) => {
    // TODO: parse URL query params

    const result = {
        error: 0,
        msg: 'Success',
        data: {}
    };

    try {
        const files = await fs.readdir(path.join(process.env.CONFIG_DATA_PATH as string, AUDIO_FILES_DIR));
        const audioList = await getAudioList();

        if (!audioList) {
            res.send(result);
            return;
        } else {
            const parsedAudioList: ApiGetAudioListItem[] = [];
            for (let i = 0; i < audioList.length; i++) {
                if (files.includes(audioList[i].filename)) {
                    parsedAudioList.push({
                        key: i,
                        id: audioList[i].id,
                        filename: audioList[i].filename,
                        text: audioList[i].text,
                        config: audioList[i].config,
                        time: new Date(audioList[i].createdAt).toISOString(),
                        url: 'http://127.0.0.1:8080/_audio/' + audioList[i].filename,
                    });
                }
            }
            _.set(result, 'data.audioList', parsedAudioList);
            res.send(result);
            return;
        }
    } catch (err) {
        console.error(err);
        result.error = ERR_SERVER_INTERNAL;
        result.msg = 'Server error';
        res.send(result);
        return;
    }
});

// Remove an audio list item
apiv1.delete('/api/v1/audio', async (req, res) => {
    const result = {
        error: 0,
        msg: 'Success',
        data: {}
    };

    // TODO: acquire resource lock

    try {
        if (!req.query.id) {
            result.error = ERR_NO_AUDIO_ID;
            result.msg = 'No audio ID',
            res.send(result);
            return;
        }
        const id = req.query.id.toString().trim();

        const audioList = await getAudioList();
        if (!audioList) {
            result.error = ERR_AUDIO_NOT_FOUND;
            result.msg = 'Audio file not found';
            res.send(result);
            return;
        } else {
            const i = audioList.findIndex((item) => item.id === id);
            if (i === -1) {
                result.error = ERR_AUDIO_NOT_FOUND;
                result.msg = 'Audio file not found';
                res.send(result);
                return;
            } else {
                audioList.splice(i, 1);
                await setAudioList(audioList);
                res.send(result);
                return;
            }
        }
    } catch (err) {
        console.error(err);
        result.error = ERR_SERVER_INTERNAL;
        result.msg = 'Server error';
        res.send(result);
        return;
    }
});

// Update an audio list item
apiv1.put('/api/v1/audio', async (req, res) => {
    const result = {
        error: 0,
        msg: 'Success',
        data: {}
    };

    // TODO: acquire resource lock

    try {
        if (!req.body.id) {
            result.error = ERR_NO_AUDIO_ID;
            result.msg = 'No audio ID',
            res.send(result);
            return;
        } else if (!req.body.filename) {
            result.error = ERR_NO_AUDIO_FILENAME;
            result.msg = 'No audio filename',
            res.send(result);
            return;
        }
        const id = req.body.id.trim();
        const filename = req.body.filename.trim();

        const audioList = await getAudioList();
        if (!audioList) {
            result.error = ERR_AUDIO_NOT_FOUND;
            result.msg = 'Audio file not found';
            res.send(result);
            return;
        } else {
            const i = audioList.findIndex((item) => item.id === id);
            if (i === -1) {
                result.error = ERR_AUDIO_NOT_FOUND;
                result.msg = 'Audio file not found';
                res.send(result);
                return;
            } else {
                audioList[i].filename = filename;
                await setAudioList(audioList);
                res.send(result);
                return;
            }
        }
    } catch (err) {
        console.error(err);
        result.error = ERR_SERVER_INTERNAL;
        result.msg = 'Server error';
        res.send(result);
        return;
    }
});

export default apiv1;
