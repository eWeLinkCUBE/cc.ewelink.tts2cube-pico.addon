import axios from 'axios';

export const SERVER_PORT = 8323;
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

export async function updateAudioItem(params: { id: string; filename: string; }) {
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

/**
 * 生成音频文件
 *
 * @param params.language 生成音频的语言
 * @param params.inputText 音频的输入文本
 * @param params.save 是否保存
 */
export async function generateAudioFile(params: { language: string; inputText: string; save: boolean; }) {
    const url = '/audio';
    return await axios({
        method: 'POST',
        baseURL: API_BASEURL,
        url,
        data: params
    });
}

/**
 * 在 iHost 上播放音频文件
 *
 * @param params.audioUrl 音频文件的 URL
 */
export async function playAudioOnIhost(params: { audioUrl: string }) {
    const url = '/ihost/play-audio';
    return await axios({
        method: 'POST',
        baseURL: API_BASEURL,
        url,
        data: params
    });
}
