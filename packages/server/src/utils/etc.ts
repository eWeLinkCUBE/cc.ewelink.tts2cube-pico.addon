import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

/**
 * Get audio files dir.
 */
export function getAudioFilesDir() {
    return path.join(process.env.CONFIG_AUDIO_DATA_PATH as string, 'audio');
}

/**
 * Get audio cache files dir.
 */
export function getAudioCacheFilesDir() {
    return path.join(process.env.CONFIG_AUDIO_DATA_PATH as string, 'audio-cache');
}

/**
 * Check if filename exist in audio files dir.
 *
 * @param filename Check filename
 */
export function existInAudioFilesDir(filename: string) {
    const dir = getAudioFilesDir();
    return fs.existsSync(path.join(dir, filename));
}
