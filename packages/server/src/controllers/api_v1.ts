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
import { getCubeToken, getTtsEngineId, setCubeToken, setTtsEngineId } from '../store/token';
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
    time: number;
};

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
    const logType = '(apiv1.getServerInfo)';

    try {
        // 1. Check token existence.
        const token = await getCubeToken();
        logger.debug(`${logType} token: ${JSON.stringify(token)}`);
        if (!token) {
            logger.warn(`${logType} getCubeToken(): no token`);
            logger.info(`${logType} Result: ${JSON.stringify(result)}`);
            return res.send(result);
        }

        // 2. Check token validation.
        const devListRes = await getCubeDeviceList();
        logger.debug(`${logType} devListRes.error: ${devListRes.error}`);
        if (devListRes.error !== ERR_SUCCESS) {
            logger.warn(`${logType} getCubeDeviceList() failed: ${devListRes.msg}`);
            logger.info(`${logType} Result: ${JSON.stringify(result)}`);
            return res.send(result);
        }

        result.data.cubeTokenValid = true;
        logger.info(`${logType} Result: ${JSON.stringify(result)}`);
        return res.send(result);
    } catch (err: any) {
        logger.error(`${logType} ${err.name}: ${err.message}`);
        result.error = ERR_SERVER_INTERNAL;
        result.msg = 'Server error'
        logger.info(`${logType} Result: ${JSON.stringify(result)}`);
        return res.send(result);
    }
});

// Get eWeLink Cube token
apiv1.get('/api/v1/get-cube-token', async (req, res) => {
    const result = {
        error: 0,
        data: {},
        msg: 'Success'
    };
    const logType = '(apiv1.getCubeToken)';

    try {
        // 1. Call getBridgeAt API.
        const atRes = await getCubeBridgeAt();
        logger.debug(`${logType} atRes: ${JSON.stringify(atRes)}`);
        if (atRes.error !== ERR_SUCCESS) {
            logger.warn(`${logType} getCubeBridgeAt() failed: ${atRes.msg}`);
            result.error = atRes.error;
            result.msg = atRes.msg;
            logger.info(`${logType} Result: ${JSON.stringify(result)}`);
            return res.send(result);
        } else {
            // TODO: acquire lock resource
            await setCubeToken(atRes.data.token);
        }

        // 2. Check TTS engine register status.
        const engineRes = await getCubeTtsEngineList();
        logger.debug(`${logType} engineRes: ${JSON.stringify(engineRes)}`);
        if (engineRes.error !== ERR_SUCCESS) {
            logger.warn(`${logType} getCubeTtsEngineList() failed: ${engineRes.msg}`);
            result.error = engineRes.error;
            result.msg = engineRes.msg;
            logger.info(`${logType} Result: ${JSON.stringify(result)}`);
            return res.send(result);
        }

        // 3. Check local TTS data.
        let shouldRegister = false;
        const engineId = await getTtsEngineId();
        logger.debug(`${logType} engineId: ${JSON.stringify(engineId)}`);
        if (!engineId) {
            shouldRegister = true;
        } else {
            const engineList = engineRes.data as { id: string; name: string; }[];
            const found = _.find(engineList, { id: engineId.id });
            if (found) {
                shouldRegister = false;
            } else {
                shouldRegister = true;
            }
        }

        // 4. Register TTS engine.
        if (shouldRegister) {
            const regRes = await registerCubeTtsEngine();
            logger.debug(`${logType} regRes: ${JSON.stringify(regRes)}`);
            if (regRes.error !== ERR_SUCCESS) {
                logger.warn(`${logType} registerCubeTtsEngine() failed: ${regRes.msg}`);
                result.error = regRes.error;
                result.msg = regRes.msg;
                logger.info(`${logType} Result: ${JSON.stringify(result)}`);
                return res.send(result);
            } else {
                // TODO: acquire lock resource
                const newEngineId = regRes.data as string;
                await setTtsEngineId(newEngineId);
            }
        }

        logger.info(`${logType} Result: ${JSON.stringify(result)}`);
        return res.send(result);
    } catch (err: any) {
        logger.error(`${logType} ${err.name}: ${err.message}`);
        result.error = ERR_SERVER_INTERNAL;
        result.msg = 'Server error';
        logger.info(`${logType} Result: ${JSON.stringify(result)}`);
        return res.send(result);
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
    const logType = '(apiv1.getAudioList)';

    try {
        const dirname = path.join(process.env.CONFIG_DATA_PATH as string, AUDIO_FILES_DIR);
        const files = await fs.readdir(dirname);
        const audioList = await getAudioList();
        logger.debug(`${logType} audioList: ${JSON.stringify(audioList)}`);

        if (!audioList) {
            logger.warn(`${logType} audioList is empty`);
            logger.info(`${logType} Result: ${JSON.stringify(result)}`);
            return res.send(result);
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
                        time: audioList[i].createdAt
                    });
                }
            }
            _.set(result, 'data.audioList', parsedAudioList);
            logger.info(`${logType} Result: ${JSON.stringify(result)}`);
            return res.send(result);
        }
    } catch (err: any) {
        logger.error(`${logType} ${err.name}: ${err.message}`);
        result.error = ERR_SERVER_INTERNAL;
        result.msg = 'Server error';
        logger.info(`${logType} Result: ${JSON.stringify(result)}`);
        return res.send(result);
    }
});

// Remove an audio list item
apiv1.delete('/api/v1/audio', async (req, res) => {
    const result = {
        error: 0,
        msg: 'Success',
        data: {}
    };
    const logType = '(apiv1.removeAudioItem)';

    // TODO: acquire resource lock

    try {
        if (!req.query.id) {
            result.error = ERR_NO_AUDIO_ID;
            result.msg = 'No audio ID';
            logger.info(`${logType} Result: ${JSON.stringify(result)}`);
            return res.send(result);
        }
        const id = req.query.id.toString().trim();

        const audioList = await getAudioList();
        logger.debug(`${logType} audioList: ${JSON.stringify(audioList)}`);
        if (!audioList) {
            result.error = ERR_AUDIO_NOT_FOUND;
            result.msg = 'Audio list is empty';
            logger.info(`${logType} Result: ${JSON.stringify(result)}`);
            return res.send(result);
        } else {
            const i = audioList.findIndex((item) => item.id === id);
            if (i === -1) {
                result.error = ERR_AUDIO_NOT_FOUND;
                result.msg = 'Audio file not found';
                logger.info(`${logType} Result: ${JSON.stringify(result)}`);
                return res.send(result);
            } else {
                // Remove real file.
                const dirname = path.join(process.env.CONFIG_DATA_PATH as string, AUDIO_FILES_DIR);
                await fs.unlink(path.join(dirname, audioList[i].filename));

                // Remove store data.
                audioList.splice(i, 1);
                await setAudioList(audioList);
                logger.info(`${logType} Result: ${JSON.stringify(result)}`);
                return res.send(result);
            }
        }
    } catch (err: any) {
        logger.error(`${logType} ${err.name}: ${err.message}`);
        result.error = ERR_SERVER_INTERNAL;
        result.msg = 'Server error';
        logger.info(`${logType} Result: ${JSON.stringify(result)}`);
        return res.send(result);
    }
});

// Update an audio list item
apiv1.put('/api/v1/audio', async (req, res) => {
    const result = {
        error: 0,
        msg: 'Success',
        data: {}
    };
    const logType = '(apiv1.updateAudioItem)';

    // TODO: acquire resource lock

    try {
        if (!req.body.id) {
            result.error = ERR_NO_AUDIO_ID;
            result.msg = 'No audio ID';
            logger.info(`${logType} Result: ${JSON.stringify(result)}`);
            return res.send(result);
        } else if (!req.body.filename) {
            result.error = ERR_NO_AUDIO_FILENAME;
            result.msg = 'No audio filename';
            logger.info(`${logType} Result: ${JSON.stringify(result)}`);
            return res.send(result);
        }
        const id = req.body.id.trim();
        const filename = req.body.filename.trim();

        const audioList = await getAudioList();
        logger.debug(`${logType} audioList: ${JSON.stringify(audioList)}`);
        if (!audioList) {
            logger.warn(`${logType} no audioList`);
            result.error = ERR_AUDIO_NOT_FOUND;
            result.msg = 'Audio file not found';
            logger.info(`${logType} Result: ${JSON.stringify(result)}`);
            return res.send(result);
        } else {
            const i = audioList.findIndex((item) => item.id === id);
            if (i === -1) {
                logger.warn(`${logType} audio file not found by ID`);
                result.error = ERR_AUDIO_NOT_FOUND;
                result.msg = 'Audio file not found';
                logger.info(`${logType} Result: ${JSON.stringify(result)}`);
                return res.send(result);
            } else {
                // Update real filename.
                const dirname = path.join(process.env.CONFIG_DATA_PATH as string, AUDIO_FILES_DIR);
                const files = await fs.readdir(dirname);
                const fileIndex = files.findIndex((item) => item === audioList[i].filename);
                if (fileIndex === -1) {
                    // could not be happen :(
                    logger.warn(`${logType} audio file not found by filename`);
                } else {
                    const oldFilename = path.join(dirname, audioList[i].filename);
                    const newFilename = path.join(dirname, filename);
                    await fs.rename(oldFilename, newFilename);
                }

                // Update store data.
                audioList[i].filename = filename;
                await setAudioList(audioList);
                logger.info(`${logType} Result: ${JSON.stringify(result)}`);
                return res.send(result);
            }
        }
    } catch (err: any) {
        logger.error(`${logType} ${err.name}: ${err.message}`);
        result.error = ERR_SERVER_INTERNAL;
        result.msg = 'Server error';
        logger.info(`${logType} Result: ${JSON.stringify(result)}`);
        return res.send(result);
    }
});

export default apiv1;
