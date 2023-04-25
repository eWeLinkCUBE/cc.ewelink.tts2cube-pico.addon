import {
    Request,
    Response,
    NextFunction
} from 'express';
import _ from 'lodash';
import logger from '../logger';
import { SERVER_LISTEN_PORT } from '../const';

// Log middleware
const log = (req: Request, res: Response, next: NextFunction) => {
    const logType = '(middleware.log)';
    const {
        ip,
        method,
        originalUrl,
        body
    } = req;
    logger.info(`${logType} HTTP Request: ${ip} => ${method} http://${req.hostname}:${SERVER_LISTEN_PORT}${originalUrl}`);
    if (!_.isEmpty(body)) {
        logger.info(`${logType} HTTP Body: ${JSON.stringify(body)}`);
    }

    next();
};

export default log;
