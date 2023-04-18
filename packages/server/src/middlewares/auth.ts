import {
    Request,
    Response,
    NextFunction
} from 'express';

// Sign middleware
const auth = (req: Request, res: Response, next: NextFunction) => {
    console.log('hello sign middle');
    next();
};

export default auth;
