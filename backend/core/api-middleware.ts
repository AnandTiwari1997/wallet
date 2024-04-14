import { NextFunction, Request, Response } from 'express';
import { ApiRequestPathParam } from '../types/api-request-path-param.js';
import { Logger } from './logger.js';

const logger = new Logger('APIMiddleware');

export const HttpRequestLogger = (req: Request<ApiRequestPathParam>, res: Response, next: NextFunction) => {
    logger.debug(
        `[HttpRequest]`,
        `[METHOD: ${req.method}]`,
        `[PATH: ${req.baseUrl}${req.path}]`,
        `[PAYLOAD: ${JSON.stringify(req.body)}]`
    );
    next();
};
