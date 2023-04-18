import {
    Request,
    Response,
    NextFunction
} from 'express';
import logger from '../logger';

// Log middleware
const log = (req: Request, res: Response, next: NextFunction) => {
    logger.info('(middleware.log) started');
    next();
};

export default log;
