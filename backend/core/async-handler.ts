import { NextFunction, Request, Response } from 'express';
import { ApiRequestPathParam } from '../types/api-request-path-param.js';

type AsyncFunction = (req: Request<ApiRequestPathParam>, res: Response, next: NextFunction) => Promise<any>;

const AsyncHandler = (execution: AsyncFunction) => (req: Request<ApiRequestPathParam>, res: Response, next: NextFunction) => {
    execution(req, res, next).catch(next);
};

export default AsyncHandler;
