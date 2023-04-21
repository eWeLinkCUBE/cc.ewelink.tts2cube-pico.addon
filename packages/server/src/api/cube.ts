import _ from 'lodash';
import CubeApi from '../ewelink-cube-api/src';
import { EWELINK_CUBE_HOSTNAME } from '../const';
import { getCubeToken } from '../store/token';
import {
    ERR_SUCCESS,
    ERR_NO_CUBE_API_CLIENT,
    ERR_TIMEOUT,
    ERR_HTTP_REQ,
    ERR_REG_ENGINE
} from '../error';

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
        }
    };

    if (!cubeApiClient) {
        result.error = ERR_NO_CUBE_API_CLIENT;
    } else {
        const res = await cubeApiClient.getBridgeAT({ timeout: 300000 });
        if (res.error === 0) {
            // TODO: save token - res.data.token
            result.data.token = res.data.token;
        } else {
            result.error = ERR_HTTP_REQ;
        }
    }

    return result;
}

// Get eWeLink Cube TTS engine list.
export async function getCubeTtsEngineList() {
    const result = {
        error: ERR_SUCCESS,
        data: {}
    };

    if (!cubeApiClient) {
        result.error = ERR_NO_CUBE_API_CLIENT;
    } else {
        const res = await cubeApiClient.getTtsEngineList();
        if (res.error === 0) {
            result.data = res.data;
        } else {
            result.error = ERR_HTTP_REQ;
        }
    }

    return result;
}

// Register eWeLink Cube TTS engine.
export async function registerCubeTtsEngine() {
    const result = {
        error: ERR_SUCCESS,
        data: {}
    };

    if (!cubeApiClient) {
        result.error = ERR_NO_CUBE_API_CLIENT;
    } else {
        const res = await cubeApiClient.registerTtsEngine({
            serviceName: 'TTS addon',
            serviceAddr: 'http://ihost:8080/api/v1/audio/list'
        });
        const errType = _.get(res, 'payload.type');
        const errDesc = _.get(res, 'payload.description');
        if (errType) {
            // TODO: log error
            console.log(errDesc);
            result.error = ERR_REG_ENGINE;
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
        data: {}
    };

    if (!cubeApiClient) {
        result.error = ERR_NO_CUBE_API_CLIENT;
    } else {
        const res = await cubeApiClient.getDeviceList();
        if (res.error === 0) {
            result.data = res.data;
        } else {
            result.error = ERR_HTTP_REQ;
        }
    }

    return result;
}
