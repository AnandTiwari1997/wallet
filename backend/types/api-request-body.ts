import { ApiCriteria } from './api-request-body-criteria.js';

/**
 * Represents the body of an API request.
 * @template T The type of the data in the request body.
 */
export interface ApiRequestBody<T> {
    /**
     * The data payload of the request.
     */
    data?: T;
    /**
     * The criteria for the request.
     */
    criteria?: ApiCriteria;
}
