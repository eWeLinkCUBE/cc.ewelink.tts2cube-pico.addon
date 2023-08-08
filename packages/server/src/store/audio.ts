import fs from 'node:fs/promises';
import process from 'node:process';
import path from 'node:path';
import Keyv from 'keyv';
import { KeyvFile } from 'keyv-file';
import { getAudioFilesDir } from '../utils/etc';

const { CONFIG_AUDIO_DATA_PATH } = process.env;
const AUDIO_FILE = 'audio.json';
const AUDIO_STORE_FILENAME = path.join(CONFIG_AUDIO_DATA_PATH as string, AUDIO_FILE);

const audioStore = new Keyv({
    store: new KeyvFile({
        filename: AUDIO_STORE_FILENAME
    })
});

/**
 * Audio item
 *
 * @param id audio item ID (UUIDv4)
 * @param filename audio filename
 * @param text audio text
 * @param config audio config
 * @param createAt audio created timestamp
 */
export type AudioItem = {
    id: string;
    filename: string;
    text: string;
    config: string;
    createdAt: number;
    label?: string;
};

export async function initAudioStore() {
    // 1. Get previous store data.
    const preAudioList = await getAudioList();

    // 2. Update store data.
    if (!preAudioList) {
        // Forget it.
        return;
    } else {
        // Get audio files.
        const dirname = getAudioFilesDir();
        const files = await fs.readdir(dirname);

        // Update audioList
        const newAudioList: AudioItem[] = [];
        for (const item of preAudioList) {
            if (files.includes(item.filename)) {
                newAudioList.push(item);
            }
        }
        await setAudioList(newAudioList);
    }
}

export async function setAudioList(audioList: AudioItem[]) {
    await audioStore.set('audioList', audioList);
}

export async function getAudioList(): Promise<AudioItem[] | undefined> {
    return await audioStore.get('audioList');
}

export async function addAudioRecord(audioRecord: AudioItem) {
    let audioList = await audioStore.get('audioList');
    if (audioList && Array.isArray(audioList)) {
        audioList.unshift(audioRecord);
    } else {
        audioList = [audioRecord];
    }
    await audioStore.set('audioList', audioList);
}
