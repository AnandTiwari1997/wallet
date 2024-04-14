import { Response } from 'express';
// import { environment } from '../config';
import { BadRequestResponse, InternalErrorResponse, NotFoundResponse } from './api-response.js';
import { environment } from '../config.js';

export enum ErrorType {
    INTERNAL = 'Internal_Error',
    NOT_FOUND = 'Not_Found_Error',
    NO_ENTRY = 'No_Entry_Error',
    NO_DATA = 'No_Data_Error',
    BAD_REQUEST = 'Bad_Request_Error'
}

export abstract class ApiError extends Error {
    protected constructor(public type: ErrorType, public message: string = 'error') {
        super(type);
    }

    public static handle(err: ApiError, res: Response): Response {
        switch (err.type) {
            case ErrorType.INTERNAL:
                return new InternalErrorResponse({ errorCode: err.type, errorMessage: err.message }).send(res);
            case ErrorType.NOT_FOUND:
            case ErrorType.NO_ENTRY:
            case ErrorType.NO_DATA:
                return new NotFoundResponse({ errorCode: err.type, errorMessage: err.message }).send(res);
            case ErrorType.BAD_REQUEST:
                return new BadRequestResponse({ errorCode: err.type, errorMessage: err.message }).send(res);
            default: {
                let message = err.message;
                if (environment === 'production') message = 'Something wrong happened.';
                return new InternalErrorResponse({ errorCode: err.type, errorMessage: message }).send(res);
            }
        }
    }
}

export class InternalError extends ApiError {
    constructor(message = 'Internal error') {
        super(ErrorType.INTERNAL, message);
    }
}

export class BadRequestError extends ApiError {
    constructor(message = 'Bad Request') {
        super(ErrorType.BAD_REQUEST, message);
    }
}

export class NotFoundError extends ApiError {
    constructor(message = 'Not Found') {
        super(ErrorType.NOT_FOUND, message);
    }
}

export class NoEntryError extends ApiError {
    constructor(message = "Entry don't exists") {
        super(ErrorType.NO_ENTRY, message);
    }
}

export class NoDataError extends ApiError {
    constructor(message = 'No data available') {
        super(ErrorType.NO_DATA, message);
    }
}
