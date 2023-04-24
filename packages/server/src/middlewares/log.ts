import {
    Request,
    Response,
    NextFunction
} from 'express';
import _ from 'lodash';
import logger from '../logger';

// Log middleware
const log = (req: Request, res: Response, next: NextFunction) => {
    const logType = '(middleware.log)';
    const {
        ip,
        method,
        originalUrl,
        body
    } = req;
    logger.info(`${logType} HTTP Request: ${ip} => ${method} ${originalUrl}`);
    if (!_.isEmpty(body)) {
        logger.info(`${logType} HTTP Body: ${JSON.stringify(body)}`);
    }
    next();
};

export default log;
