/**
 * @file This file contains the ApiResponse class and its subclasses.
 * @packageDocumentation
 */
import { Response } from 'express';
import { ApiResponseBody, MessageResponseBody } from '../types/api-response-body.js';
import { ApiErrorResponseBody } from '../types/api-error-response-body.js';

/**
 * Enum for response status codes.
 */
enum ResponseStatus {
    SUCCESS = 200,
    BAD_REQUEST = 400,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_ERROR = 500
}

/**
 * Abstract class for API responses.
 */
abstract class ApiResponse {
    /**
     * @param status The response status code.
     * @param response The response body.
     */
    protected constructor(
        protected status: ResponseStatus,
        protected response: ApiResponseBody<any> | ApiErrorResponseBody | { message: string }
    ) {}

    /**
     * Sanitizes the response by removing any undefined properties.
     * @param response The response to sanitize.
     * @returns The sanitized response.
     */
    private static sanitize<T extends ApiResponse>(
        response: ApiResponseBody<any> | ApiErrorResponseBody | { message: string }
    ): any {
        const clone: any = {};
        Object.assign(clone, response);
        // tslint:disable-next-line: forin
        for (const i in clone) if (typeof clone[i] === 'undefined') delete clone[i];
        return clone;
    }

    /**
     * Sends the response.
     * @param res The express response object.
     * @param headers The headers to send with the response.
     * @returns The express response object.
     */
    public send(res: Response, headers: { [key: string]: string } = {}): Response {
        return this.prepare<ApiResponse>(res, this, headers);
    }

    /**
     * Prepares the response before sending.
     * @param res The express response object.
     * @param response The response to send.
     * @param headers The headers to send with the response.
     * @returns The express response object.
     */
    protected prepare<T extends ApiResponse>(res: Response, response: T, headers: { [key: string]: string }): Response {
        for (const [key, value] of Object.entries(headers)) res.append(key, value);
        return res.status(this.status).json(ApiResponse.sanitize(response.response));
    }
}

/**
 * Class for 404 Not Found responses.
 */
export class NotFoundResponse extends ApiResponse {
    /**
     * @param data The error response body.
     */
    constructor(data: ApiErrorResponseBody) {
        super(ResponseStatus.NOT_FOUND, data);
    }

    /**
     * Sends the response.
     * @param res The express response object.
     * @param headers The headers to send with the response.
     * @returns The express response object.
     */
    send(res: Response, headers: { [key: string]: string } = {}): Response {
        return super.prepare<NotFoundResponse>(res, this, headers);
    }
}

/**
 * Class for 400 Bad Request responses.
 */
export class BadRequestResponse extends ApiResponse {
    /**
     * @param data The error response body.
     */
    constructor(data: ApiErrorResponseBody) {
        super(ResponseStatus.BAD_REQUEST, data);
    }
}

/**
 * Class for 500 Internal Server Error responses.
 */
export class InternalErrorResponse extends ApiResponse {
    /**
     * @param data The error response body.
     */
    constructor(data: ApiErrorResponseBody) {
        super(ResponseStatus.INTERNAL_ERROR, data);
    }
}

/**
 * Class for success responses with a message.
 */
export class SuccessMsgResponse extends ApiResponse {
    /**
     * @param message The success message.
     */
    constructor(message: string) {
        super(ResponseStatus.SUCCESS, { message: message });
    }
}

/**
 * Class for failure responses with a message.
 */
export class FailureMsgResponse extends ApiResponse {
    /**
     * @param message The failure message.
     */
    constructor(message: string) {
        super(ResponseStatus.SUCCESS, { message: message });
    }
}

/**
 * Class for success responses with data.
 */
export class SuccessResponse<T extends ApiResponseBody<any> | MessageResponseBody<string>> extends ApiResponse {
    /**
     * @param data The response data.
     */
    constructor(private data: T) {
        super(ResponseStatus.SUCCESS, data);
    }

    /**
     * Sends the response.
     * @param res The express response object.
     * @param headers The headers to send with the response.
     * @returns The express response object.
     */
    send(res: Response, headers: { [key: string]: string } = {}): Response {
        return super.prepare<SuccessResponse<T>>(res, this, headers);
    }
}
