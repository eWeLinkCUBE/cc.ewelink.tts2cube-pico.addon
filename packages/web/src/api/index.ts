import axios from 'axios';

const API_HOST = '127.0.0.1';
const API_PORT = 8080;
const API_BASEURL = `http://${API_HOST}:${API_PORT}/api/v1`;

export async function getAudioList(pagesize = 10, pagenum = 1) {
    const url = '/audio/list';
    return await axios({
        method: 'GET',
        baseURL: API_BASEURL,
        url,
        params: {
            pagenum,
            pagesize
        }
    });
}

export async function getServerInfo() {
    const url = '/get-server-info';
    return await axios({
        method: 'GET',
        baseURL: API_BASEURL,
        url
    });
}

export async function getCubeToken() {
    const url = '/get-cube-token';
    return await axios({
        method: 'GET',
        baseURL: API_BASEURL,
        url
    });
}
