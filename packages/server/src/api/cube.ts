import process from 'node:process';
import _ from 'lodash';
import CubeApi from '../ewelink-cube-api/src';
import { getCubeToken } from '../store/token';
import {
    ERR_SUCCESS,
    ERR_NO_CUBE_API_CLIENT,
    ERR_HTTP_REQ,
    ERR_REG_ENGINE,
    ERR_CUBE_API_TOKEN_INVALID,
    ERR_CUBE_API_TIMEOUT,
    ERR_CUBE_API_UNKNOWN
} from '../error';
import { GET_BRIDGE_AT_TIMEOUT, SERVER_LISTEN_PORT } from '../const';
import logger from '../logger';

const EWELINK_CUBE_HOSTNAME = process.env.CONFIG_CUBE_HOSTNAME as string;
const CubeApiClient = CubeApi.ihostApi;
let cubeApiClient: any = null;

// Init eWeLink Cube API client.
export async function initCubeApi() {
    const tokenData = await getCubeToken();
    logger.debug(`(cubeApi.initCubeApi) EWELINK_CUBE_HOSTNAME: ${EWELINK_CUBE_HOSTNAME}`);
    logger.debug(`(cubeApi.initCubeApi) tokenData: ${JSON.stringify(tokenData)}`);
    if (tokenData) {
        cubeApiClient = new CubeApiClient({ ip: EWELINK_CUBE_HOSTNAME, at: tokenData.token });
    } else {
        cubeApiClient = new CubeApiClient({ ip: EWELINK_CUBE_HOSTNAME });
    }
}

// Get eWeLink Cube Access Token.
export async function getCubeBridgeAt() {
    const result = {
        error: ERR_SUCCESS,
        data: {
            token: ''
        },
        msg: ''
    };

    if (!cubeApiClient) {
        result.error = ERR_NO_CUBE_API_CLIENT;
    } else {
        const res = await cubeApiClient.getBridgeAT({ timeout: GET_BRIDGE_AT_TIMEOUT }, process.env.APP_NAME);
        logger.debug(`(cubeApi.getBridgeAt) res: ${JSON.stringify(res)}`);
        if (res.error === 0) {
            result.data.token = res.data.token;
        } else if (res.error === 1001) {
            result.error = ERR_CUBE_API_TIMEOUT;
            result.msg = 'eWeLink Cube API request timeout';
        } else {
            result.error = ERR_CUBE_API_UNKNOWN;
            result.msg = 'eWeLink Cube API unknown error';
        }
    }

    return result;
}

// Get eWeLink Cube TTS engine list.
export async function getCubeTtsEngineList() {
    const result = {
        error: ERR_SUCCESS,
        data: {},
        msg: ''
    };

    if (!cubeApiClient) {
        result.error = ERR_NO_CUBE_API_CLIENT;
    } else {
        const res = await cubeApiClient.getTtsEngineList();
        logger.debug(`(cubeApi.getTtsEngineList) res: ${JSON.stringify(res)}`);
        if (res.error === 0) {
            result.data = res.data;
        } else {
            result.error = ERR_HTTP_REQ;
            result.msg = 'HTTP request error';
        }
    }

    return result;
}

// Register eWeLink Cube TTS engine.
export async function registerCubeTtsEngine() {
    const result = {
        error: ERR_SUCCESS,
        data: {},
        msg: ''
    };

    if (!cubeApiClient) {
        result.error = ERR_NO_CUBE_API_CLIENT;
    } else {
        const res = await cubeApiClient.registerTtsEngine({
            serviceName: process.env.APP_NAME,
            serviceAddr: `http://${EWELINK_CUBE_HOSTNAME}:${SERVER_LISTEN_PORT}/api/v1/ihost/callback`
        });
        logger.debug(`(cubeApi.registerTtsEngine) res: ${JSON.stringify(res)}`);
        const errType = _.get(res, 'payload.type');
        const errDesc = _.get(res, 'payload.description');
        if (errType) {
            // TODO: log error
            console.log(errDesc);
            result.error = ERR_REG_ENGINE;
            result.msg = 'Register TTS engine failed';
        } else {
            // TODO: save TTS engine ID
            result.data = res.payload.engine_id;
        }
    }

    return result;
}

// Get eWeLink Cube device list. (Check access token)
export async function getCubeDeviceList() {
    const result = {
        error: ERR_SUCCESS,
        data: {},
        msg: ''
    };

    if (!cubeApiClient) {
        result.error = ERR_NO_CUBE_API_CLIENT;
    } else {
        const res = await cubeApiClient.getDeviceList();
        logger.debug(`(cubeApi.getDeviceList) res.error: ${res.error}`);
        if (res.error === 0) {
            result.data = res.data;
        } else if (res.error === 401) {
            result.error = ERR_CUBE_API_TOKEN_INVALID;
            result.msg = 'eWeLink Cube API token invalid';
        } else if (res.error === 1000) {
            result.error = ERR_CUBE_API_TIMEOUT;
            result.msg = 'eWeLink Cube API request timeout';
        } else {
            result.error = ERR_CUBE_API_UNKNOWN;
            result.msg = 'eWeLink Cube API unknown error';
        }
    }

    return result;
}

// Play audio file on iHost
export async function playAudioFile(audioUrl: string) {
    const result = {
        error: ERR_SUCCESS,
        data: {},
        msg: ''
    };

    if (!cubeApiClient) {
        result.error = ERR_NO_CUBE_API_CLIENT;
    } else {
        const res = await cubeApiClient.playAudio(audioUrl);
        logger.debug(`(cubeApi.playAudioFile) res.error: ${res.error}  ${JSON.stringify(res)}`);
        if (res.error === 0) {
            result.data = res.data;
        } else if (res.error === 401) {
            result.error = ERR_CUBE_API_TOKEN_INVALID;
            result.msg = 'eWeLink Cube API token invalid';
        } else if (res.error === 1000) {
            result.error = ERR_CUBE_API_TIMEOUT;
            result.msg = 'eWeLink Cube API request timeout';
        } else {
            result.error = ERR_CUBE_API_UNKNOWN;
            result.msg = 'eWeLink Cube API unknown error';
        }
    }

    return result;
}
