import { Response } from 'express';
import { ApiResponseBody } from '../types/api-response-body.js';
import { ApiErrorResponseBody } from '../types/api-error-response-body.js';

enum ResponseStatus {
    SUCCESS = 200,
    BAD_REQUEST = 400,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_ERROR = 500
}

abstract class ApiResponse {
    protected constructor(
        protected status: ResponseStatus,
        protected response: ApiResponseBody<any> | ApiErrorResponseBody | { message: string }
    ) {}

    private static sanitize<T extends ApiResponse>(response: ApiResponseBody<any> | ApiErrorResponseBody | { message: string }): any {
        const clone: any = {};
        Object.assign(clone, response);
        for (const i in clone) if (typeof clone[i] === 'undefined') delete clone[i];
        return clone;
    }

    public send(res: Response, headers: { [key: string]: string } = {}): Response {
        return this.prepare<ApiResponse>(res, this, headers);
    }

    protected prepare<T extends ApiResponse>(res: Response, response: T, headers: { [key: string]: string }): Response {
        for (const [key, value] of Object.entries(headers)) res.append(key, value);
        return res.status(this.status).json(ApiResponse.sanitize(response.response));
    }
}

export class NotFoundResponse extends ApiResponse {
    constructor(data: ApiErrorResponseBody) {
        super(ResponseStatus.NOT_FOUND, data);
    }

    send(res: Response, headers: { [key: string]: string } = {}): Response {
        return super.prepare<NotFoundResponse>(res, this, headers);
    }
}

export class BadRequestResponse extends ApiResponse {
    constructor(data: ApiErrorResponseBody) {
        super(ResponseStatus.BAD_REQUEST, data);
    }
}

export class InternalErrorResponse extends ApiResponse {
    constructor(data: ApiErrorResponseBody) {
        super(ResponseStatus.INTERNAL_ERROR, data);
    }
}

export class SuccessMsgResponse extends ApiResponse {
    constructor(message: string) {
        super(ResponseStatus.SUCCESS, { message: message });
    }
}

export class FailureMsgResponse extends ApiResponse {
    constructor(message: string) {
        super(ResponseStatus.SUCCESS, { message: message });
    }
}

export class SuccessResponse<T extends ApiResponseBody<any> | { message: string }> extends ApiResponse {
    constructor(private data: T) {
        super(ResponseStatus.SUCCESS, data);
    }

    send(res: Response, headers: { [key: string]: string } = {}): Response {
        return super.prepare<SuccessResponse<T>>(res, this, headers);
    }
}
