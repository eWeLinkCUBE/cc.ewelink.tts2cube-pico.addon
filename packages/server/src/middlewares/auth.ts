import {
    Request,
    Response,
    NextFunction
} from 'express';
import logger from '../logger';

// Sign middleware
const auth = (req: Request, res: Response, next: NextFunction) => {
    logger.info('(middleware.auth) test');
    next();
};

export default auth;
