import path from 'node:path';
import process from 'node:process';

/**
 * Get audio files dir.
 */
export function getAudioFilesDir() {
    return path.join(process.env.CONFIG_AUDIO_DATA_PATH as string, 'audio');
}
