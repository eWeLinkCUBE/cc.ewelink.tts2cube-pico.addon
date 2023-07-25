// Pico TTS utils

import path from 'node:path';
import { execSync } from 'node:child_process';
import { getAudioCacheFilesDir, getAudioFilesDir } from './etc';
import logger from '../logger';

/**
 * function generateAudioFile params
 *
 * @param language output language, valid languages: en-US, en-GB, de-DE, es-ES, fr-FR, it-IT
 * @param audioFilename output audio file name
 * @param inputText input text
 * @param save save audio file?
 */
export interface GenerateAudioFileParams {
    language: string;
    audioFilename: string;
    inputText: string;
    save: boolean;
}

/**
 * Escape string before generate audio file.
 *
 * @param s Input string
 */
export function escapeText(s: string) {
    let result = '';
    for (const c of s) {
        if (c === '"' || c === '$' || c === '`' || c === '\\') {
            result += '\\';
        }
        result += c;
    }
    return result;
}

/**
 * Generate audo file. Success return 0, otherwise -1.
 *
 * @param params TTS params
 * @example
 *
 * generateAudioFile({
 *     language: 'en-US',
 *     audioFilename: 'test.wav',
 *     inputText: 'Pico TTS engine.',
 *     save: true
 * });
 */
export async function generateAudioFile(params: GenerateAudioFileParams) {
    const logType = '(utils.pico.generateAudioFile)';
    logger.debug(`${logType} params: ${JSON.stringify(params)}`);
    try {
        const {
            language,
            audioFilename,
            inputText,
            save
        } = params;
        const dir = save ? getAudioFilesDir() : getAudioCacheFilesDir();
        const tmpFilename = path.join(dir, `t${audioFilename}`);
        const filename = path.join(dir, audioFilename);
        execSync(`pico2wave -l ${language} -w ${tmpFilename} "${escapeText(inputText)}"`);
        execSync(`ffmpeg -i ${tmpFilename} -loglevel 16 -vcodec copy -af "volume=10dB" ${filename}`);
        execSync(`rm ${tmpFilename}`);
        return 0;
    } catch (err: any) {
        logger.error(`${logType} error: ${err.message}`);
        return -1;
    }
}
