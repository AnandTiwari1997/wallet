import { NextFunction, Request, Response } from 'express';
import { ApiRequestPathParam } from '../types/api-request-path-param.js';

// A type for an async function that handles API requests.
type AsyncFunction = (req: Request<ApiRequestPathParam>, res: Response, next: NextFunction) => Promise<any>;
// A type for any async function that returns a promise of void.
type AnyAsyncFunction = (...args: any) => Promise<void>;
// A type for any function that returns void.
type AnyFunction = (...args: any) => void;

/**
 * A higher-order function that wraps an async API handler to catch any errors and pass them to the next middleware.
 * @param execution The async function to execute.
 * @returns An Express request handler.
 */
export const AsyncApiHandler =
    (execution: AsyncFunction) => (req: Request<ApiRequestPathParam>, res: Response, next: NextFunction) => {
        execution(req, res, next).catch(next);
    };

/**
 * A higher-order function that wraps a function with a try-catch block to handle any exceptions.
 * @param callback The function to execute.
 * @returns A function that executes the callback with error handling.
 */
export const ExceptionHandler =
    (callback: AnyFunction) =>
    (...args: any) => {
        try {
            callback(...args);
        } catch (exception) {
            console.error('Following exception has occurred :', exception);
        }
    };

/**
 * A higher-order function that wraps an async function with a try-catch block to handle any exceptions.
 * @param callback The async function to execute.
 * @returns A function that executes the async callback with error handling.
 */
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
