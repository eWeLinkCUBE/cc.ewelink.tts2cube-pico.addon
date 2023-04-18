import CubeApi from '../ewelink-cube-api/src';
import { EWELINK_CUBE_HOSTNAME } from '../const';
import { getCubeToken } from '../store/token';

const CubeApiClient = CubeApi.ihostApi;
let cubeApiClient = null;

export async function initCubeApi() {
    const tokenData = await getCubeToken();
    if (tokenData) {
        cubeApiClient = new CubeApiClient({ ip: EWELINK_CUBE_HOSTNAME, at: tokenData.token });
    } else {
        cubeApiClient = new CubeApiClient({ ip: EWELINK_CUBE_HOSTNAME });
    }
}
