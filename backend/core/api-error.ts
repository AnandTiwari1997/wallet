import { Response } from 'express';
// import { environment } from '../config';
import { BadRequestResponse, InternalErrorResponse, NotFoundResponse } from './api-response.js';
import { environment } from '../config.js';

/**
 * Defines the types of API errors that can occur.
 */
export enum ErrorType {
    INTERNAL = 'Internal_Error',
    NOT_FOUND = 'Not_Found_Error',
    NO_ENTRY = 'No_Entry_Error',
    NO_DATA = 'No_Data_Error',
    BAD_REQUEST = 'Bad_Request_Error'
}

/**
 * Abstract base class for all API errors.
 */
export abstract class ApiError extends Error {
    /**
     * Creates an instance of ApiError.
     * @param type The type of the error.
     * @param message The error message.
     */
    protected constructor(public type: ErrorType, public message: string = 'error') {
        super(type);
    }

    /**
     * Handles an API error and sends an appropriate response.
     * @param err The API error to handle.
     * @param res The Express response object.
     * @returns The Express response object.
     */
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
                // In production, hide the actual error message from the client.
                if (environment === 'production') message = 'Something wrong happened.';
                return new InternalErrorResponse({ errorCode: err.type, errorMessage: message }).send(res);
            }
        }
    }
}

/**
 * Represents an internal server error.
 */
export class InternalError extends ApiError {
    /**
     * Creates an instance of InternalError.
     * @param message The error message.
     */
    constructor(message = 'Internal error') {
        super(ErrorType.INTERNAL, message);
    }
}

/**
 * Represents a bad request error.
 */
export class BadRequestError extends ApiError {
    /**
     * Creates an instance of BadRequestError.
     * @param message The error message.
     */
    constructor(message = 'Bad Request') {
        super(ErrorType.BAD_REQUEST, message);
    }
}

/**
 * Represents a not found error.
 */
export class NotFoundError extends ApiError {
    /**
     * Creates an instance of NotFoundError.
     * @param message The error message.
     */
    constructor(message = 'Not Found') {
        super(ErrorType.NOT_FOUND, message);
    }
}

/**
 * Represents an error where an entry does not exist.
 */
export class NoEntryError extends ApiError {
    /**
     * Creates an instance of NoEntryError.
     * @param message The error message.
     */
    constructor(message = "Entry don't exists") {
        super(ErrorType.NO_ENTRY, message);
    }
}

/**
 * Represents an error where no data is available.
 */
export class NoDataError extends ApiError {
    /**
     * Creates an instance of NoDataError.
     * @param message The error message.
     */
    constructor(message = 'No data available') {
        super(ErrorType.NO_DATA, message);
    }
}
