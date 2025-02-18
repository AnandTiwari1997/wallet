import { NextFunction, Request, Response } from 'express';
import { ApiRequestPathParam } from '../types/api-request-path-param.js';
import { ApiRequestBody } from '../types/api-request-body.js';
import { ApiCriteria } from '../types/api-request-body-criteria.js';
import { ApiResponseBody } from '../types/api-response-body.js';
import { Deserializer } from './deserializer.js';

type ApiHandler<T, R> = (
    req: Request<ApiRequestPathParam, T, ApiRequestBody<R>>,
    res: Response<T>,
    next: NextFunction
) => Promise<Response<T>>;

type Handler<T, R> = (
    req: Request<ApiRequestPathParam, T, ApiRequestBody<R>>,
    res: Response<T>,
    next: NextFunction
) => Response<T>;

type AsyncApiExecutor<T, R> = (
    criteria: ApiCriteria,
    data: T | undefined,
    res: Response<ApiResponseBody<R>>,
    next: NextFunction
) => Promise<Response<ApiResponseBody<R>>>;

type ApiExecutor<T, R> = (
    criteria: ApiCriteria,
    data: T | undefined,
    res: Response<ApiResponseBody<R>>,
    next: NextFunction
) => Response<ApiResponseBody<R>>;

export const AsyncApiHandler =
    <T, R>(execution: ApiHandler<T, R>) =>
    (req: Request<ApiRequestPathParam, T, ApiRequestBody<R>>, res: Response<T>, next: NextFunction) => {
        execution(req, res, next).catch(next);
    };

export const ApiHandler =
    <T, R>(execution: Handler<T, R>) =>
    (req: Request<ApiRequestPathParam, T, ApiRequestBody<R>>, res: Response<T>, next: NextFunction) => {
        execution(req, res, next);
        next();
    };

export const DeserializedAsyncApiHandler =
    <T, R>(execution: AsyncApiExecutor<T, R>, deserializer: Deserializer<T>) =>
    (
        req: Request<ApiRequestPathParam, ApiResponseBody<R>, ApiRequestBody<{ [key: string]: string | object }>>,
        res: Response<ApiResponseBody<R>>,
        next: NextFunction
    ) => {
        execution(req.body.criteria || {}, deserializer.deserialize(req.body.data), res, next).catch(next);
    };

export const DeserializedApiHandler =
    <T, R>(execution: ApiExecutor<T, R>, deserializer: Deserializer<T>) =>
    (
        req: Request<ApiRequestPathParam, ApiResponseBody<R>, ApiRequestBody<{ [key: string]: string | object }>>,
        res: Response<ApiResponseBody<R>>,
        next: NextFunction
    ) => {
        execution(req.body.criteria || {}, deserializer.deserialize(req.body.data), res, next);
        next();
    };

type AnyAsyncFunction = (...args: any) => Promise<void>;
type AnyFunction = (...args: any) => void;

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
