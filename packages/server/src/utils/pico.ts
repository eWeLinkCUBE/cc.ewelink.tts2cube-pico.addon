// Pico TTS utils

import path from 'node:path';
import { execSync } from 'node:child_process';
import { getAudioFilesDir } from './etc';
import logger from '../logger';

/**
 * function generateAudioFile params
 *
 * @param language output language, valid languages: en-US, en-GB, de-DE, es-ES, fr-FR, it-IT
 * @param audioFilename output audio file name
 * @param inputText input text
 */
export interface GenerateAudioFileParams {
    language: string;
    audioFilename: string;
    inputText: string;
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
 *     inputText: 'Pico TTS engine.'
 * });
 */
export async function generateAudioFile(params: GenerateAudioFileParams) {
    const logType = '(utils.pico.generateAudioFile)';
    logger.debug(`${logType} params: ${JSON.stringify(params)}`);
    try {
        const {
            language,
            audioFilename,
            inputText
        } = params;
        const filename = path.join(getAudioFilesDir(), audioFilename);
        execSync(`pico2wave -l ${language} -w ${filename} '${inputText}'`);
        return 0;
    } catch (err: any) {
        logger.error(`${logType} error: ${err.message}`);
        return -1;
    }
}
