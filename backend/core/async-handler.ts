import { NextFunction, Request, Response } from 'express';
import { ApiRequestPathParam } from '../types/api-request-path-param.js';

type AsyncFunction = (req: Request<ApiRequestPathParam>, res: Response, next: NextFunction) => Promise<any>;
type AnyAsyncFunction = (...args: any) => Promise<void>;
type AnyFunction = (...args: any) => void;

export const AsyncApiHandler =
    (execution: AsyncFunction) => (req: Request<ApiRequestPathParam>, res: Response, next: NextFunction) => {
        execution(req, res, next).catch(next);
    };

export const ExceptionHandler =
    (callback: AnyFunction) =>
    (...args: any) => {
        try {
            callback(...args);
        } catch (exception) {
            console.error('Following exception has occurred :', exception);
        }
    };

export const AsyncExceptionHandler =
    (callback: AnyAsyncFunction) =>
    (...args: any) => {
        try {
            callback(...args).catch((reason) => {
                console.error('Following exception has occurred :', reason);
            });
        } catch (exception) {
            console.error('Following exception has occurred :', exception);
        }
    };
