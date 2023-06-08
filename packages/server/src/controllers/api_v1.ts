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
import {
    getCubeToken,
    getTtsEngineId,
    setCubeToken,
    setTtsEngineId
} from '../store/token';
import {
    ERR_SUCCESS,
    ERR_SERVER_INTERNAL,
    ERR_NO_AUDIO_ID,
    ERR_AUDIO_NOT_FOUND,
    ERR_NO_AUDIO_FILENAME
} from '../error';
import { getAudioList, setAudioList } from '../store/audio';
import { getAudioFilesDir } from '../utils/etc';
import { SERVER_LISTEN_PORT } from '../const';
import {
    EV_SSE_SEND,
    SSE_EVENT_CONNECTED,
    SSE_EVENT_GET_TOKEN_END,
    SSE_EVENT_GET_TOKEN_START,
    eventCenter
} from '../utils/event';

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
            cubeTokenValid: false,
            tokenUpdateTime: 0
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
        result.data.tokenUpdateTime = token.updateTime;
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

// SSE events
apiv1.get('/events', async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Connection', 'keep-alive');

    const EV_SSE_SEND_HANDLER = (data: string) => {
        res.write(data);
    };
    eventCenter.on(EV_SSE_SEND, EV_SSE_SEND_HANDLER);

    req.on('close', () => {
        eventCenter.removeListener(EV_SSE_SEND, EV_SSE_SEND_HANDLER);
    });
    req.on('finish', () => {
        eventCenter.removeListener(EV_SSE_SEND, EV_SSE_SEND_HANDLER);
    });
    req.on('error', () => {
        eventCenter.removeListener(EV_SSE_SEND, EV_SSE_SEND_HANDLER);
    });

    res.write(`event: ${SSE_EVENT_CONNECTED}\n\n`);
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
        eventCenter.emit(`event: ${SSE_EVENT_GET_TOKEN_START}\n\n`);
        const atRes = await getCubeBridgeAt();
        logger.debug(`${logType} atRes: ${JSON.stringify(atRes)}`);
        if (atRes.error !== ERR_SUCCESS) {
            logger.warn(`${logType} getCubeBridgeAt() failed: ${atRes.msg}`);
            result.error = atRes.error;
            result.msg = atRes.msg;
            logger.info(`${logType} Result: ${JSON.stringify(result)}`);
            eventCenter.emit(`event: ${SSE_EVENT_GET_TOKEN_END}\n\n`);
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
            eventCenter.emit(`event: ${SSE_EVENT_GET_TOKEN_END}\n\n`);
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
                eventCenter.emit(`event: ${SSE_EVENT_GET_TOKEN_END}\n\n`);
                return res.send(result);
            } else {
                // TODO: acquire lock resource
                const newEngineId = regRes.data as string;
                await setTtsEngineId(newEngineId);
            }
        }

        logger.info(`${logType} Result: ${JSON.stringify(result)}`);
        eventCenter.emit(`event: ${SSE_EVENT_GET_TOKEN_END}\n\n`);
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
        const dirname = getAudioFilesDir();
        const files = await fs.readdir(dirname);
        const audioList = await getAudioList();
        logger.debug(`${logType} audioList: ${JSON.stringify(audioList)}`);

        if (!audioList) {
            logger.warn(`${logType} audioList is empty`);
            logger.info(`${logType} Result: ${JSON.stringify(result)}`);
            _.set(result, 'data.audioList', []);
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

// iHost callback - sync audio list
apiv1.post('/api/v1/ihost/sync-audio-list', async (req, res) => {
    const reqMsgId = _.get(req, 'body.directive.header.message_id');
    const reqMsgName = _.get(req, 'body.directive.header.name');
    const logType = '(apiv1.ihost.syncAudioList))';

    if (reqMsgName !== 'SyncTTSAudioList') {
        return res.send({
            event: {
                header: {
                    name: 'ErrorResponse',
                    message_id: reqMsgId,
                    version: '1'
                },
                payload: {
                    type: 'INVALID_PARAMETERS',
                    description: 'invalid header name'
                }
            }
        });
    }

    const result: any = {
        event: {
            header: {
                name: 'Response',
                message_id: reqMsgId,
                version: '1'
            },
            payload: {
                audio_list: []
            }
        }
    };

    try {
        const dirname = getAudioFilesDir();
        const files = await fs.readdir(dirname);
        const audioList = await getAudioList();
        logger.debug(`${logType} audioList: ${JSON.stringify(audioList)}`);

        if (!audioList) {
            logger.warn(`${logType} audioList is empty`);
            logger.info(`${logType} Result: ${JSON.stringify(result)}`);
            return res.send(result);
        } else {
            for (let i = 0; i < audioList.length; i++) {
                if (files.includes(audioList[i].filename)) {
                    result.event.payload.audio_list.push({
                        url: `http://${process.env.CONFIG_CUBE_HOSTNAME}:${SERVER_LISTEN_PORT}/_audio/${audioList[i].filename}`,
                        label: audioList[i].filename
                    });
                }
            }
            logger.info(`${logType} Result: ${JSON.stringify(result)}`);
            return res.send(result);
        }
    } catch (err: any) {
        const errRes = {
            event: {
                header: {
                    name: 'ErrorResponse',
                    message_id: reqMsgId,
                    version: '1'
                },
                payload: {
                    type: 'INTERNAL_ERROR',
                    description: `server internal error: ${err.message}`
                }
            }
        };
        logger.error(`${logType} ${err.name}: ${err.message}`);
        logger.info(`${logType} Result: ${JSON.stringify(errRes)}`);
        return res.send(errRes);

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
                const dirname = getAudioFilesDir();
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
                const dirname = getAudioFilesDir();
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
