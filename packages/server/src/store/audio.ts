import process from 'node:process';
import path from 'node:path';
import Keyv from 'keyv';
import { KeyvFile } from 'keyv-file';

const { CONFIG_DATA_PATH } = process.env;
const AUDIO_FILE = 'audio.json';
const AUDIO_STORE_FILENAME = CONFIG_DATA_PATH ? path.join(CONFIG_DATA_PATH, AUDIO_FILE) : AUDIO_FILE;

const audioStore = new Keyv({
    store: new KeyvFile({
        filename: AUDIO_STORE_FILENAME
    })
});

export type AudioItem = {
    id: string;
    filename: string;
    exist?: boolean;
};

export async function initAudioStore() {
    const audioList = await getAudioList();
}

export async function setAudioList(audioList: AudioItem[]) {
    await audioStore.set('audioList', audioList);
}

export async function getAudioList(): Promise<AudioItem[] | undefined> {
    return await audioStore.get('audioList');
}

export async function removeAudioItem() {}

export async function updateAudioItem() {}
