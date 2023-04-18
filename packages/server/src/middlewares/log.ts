import {
    Request,
    Response,
    NextFunction
} from 'express';

// Log middleware
const log = (req: Request, res: Response, next: NextFunction) => {
    console.log('hello log middle');
    next();
};

export default log;
