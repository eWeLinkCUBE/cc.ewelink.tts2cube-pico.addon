import process from 'node:process';
import _ from 'lodash';
import CubeApi from '../ewelink-cube-api/src';
import { getCubeToken } from '../store/token';
import {
    ERR_SUCCESS,
    ERR_NO_CUBE_API_CLIENT,
    ERR_TIMEOUT,
    ERR_HTTP_REQ,
    ERR_REG_ENGINE
} from '../error';
import { GET_BRIDGE_AT_TIMEOUT, SERVER_LISTEN_PORT } from '../const';

const EWELINK_CUBE_HOSTNAME = process.env.CONFIG_CUBE_HOSTNAME as string;
const CubeApiClient = CubeApi.ihostApi;
let cubeApiClient: any = null;

// Init eWeLink Cube API client.
export async function initCubeApi() {
    const tokenData = await getCubeToken();
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
        const res = await cubeApiClient.getBridgeAT({ timeout: GET_BRIDGE_AT_TIMEOUT });
        if (res.error === 0) {
            result.data.token = res.data.token;
        } else if (res.error === 1001) {
            result.error = ERR_TIMEOUT;
            result.msg = 'Timeout';
        } else {
            result.error = ERR_HTTP_REQ;
            result.msg = 'HTTP request error';
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
            serviceName: 'TTS addon',
            serviceAddr: `http://${EWELINK_CUBE_HOSTNAME}:${SERVER_LISTEN_PORT}/api/v1/audio/list`
        });
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
        if (res.error === 0) {
            result.data = res.data;
        } else {
            result.error = ERR_HTTP_REQ;
            result.msg = 'HTTP request error';
        }
    }

    return result;
}
