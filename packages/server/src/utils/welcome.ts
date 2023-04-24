import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import logger from '../logger';
import { BUILDINFO_FILE } from '../const';

/**
 * Print build info.
 */
export const printBuildinfo = () => {
    try {
        const filename = path.join(process.cwd(), BUILDINFO_FILE);
        const res = fs.readFileSync(filename);
        const contentList = res.toString().trim().split('\n');
        for (const item of contentList) {
            logger.info(item);
        }
    } catch (err: any) {
        logger.error(err.message);
        process.exit(1);
    }
};
