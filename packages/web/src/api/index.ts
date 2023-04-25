import axios from 'axios';

export const SERVER_PORT = 8080;
const API_BASEURL = `http://${location.hostname}:${SERVER_PORT}/api/v1`;

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

export async function removeAudioItem(id: string) {
    const url = '/audio';
    return await axios({
        method: 'DELETE',
        baseURL: API_BASEURL,
        url,
        params: {
            id
        }
    });
}

export async function updateAudioItem(params: { id: string; filename: string}) {
    const { id, filename } = params;
    const url = '/audio';
    return await axios({
        method: 'PUT',
        baseURL: API_BASEURL,
        url,
        data: {
            id,
            filename
        }
    });
}
