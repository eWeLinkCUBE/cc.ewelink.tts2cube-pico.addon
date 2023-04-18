import process from 'node:process';
import path from 'node:path';
import Keyv from 'keyv';
import { KeyvFile } from 'keyv-file';

const { CONFIG_DATA_PATH } = process.env;
const TOKEN_FILE = 'token.json';
const TOKEN_STORE_FILENAME = CONFIG_DATA_PATH ? path.join(CONFIG_DATA_PATH, TOKEN_FILE) : TOKEN_FILE;

const tokenStore = new Keyv({
    store: new KeyvFile({
        filename: TOKEN_STORE_FILENAME
    })
});

export async function setCubeToken(token: string) {
    const data = {
        token,
        updateTime: Date.now()
    };
    await tokenStore.set('cubeToken', data);
}

export async function getCubeToken(): Promise<{ token: string; updateTime: number; }> {
    return await tokenStore.get('cubeToken');
}
