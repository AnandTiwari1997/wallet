import { ApiCriteria } from './api-request-body-criteria.js';

export interface ApiRequestBody<T> {
    data?: T;
    criteria?: ApiCriteria;
}
