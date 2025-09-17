import * as core from 'express-serve-static-core';

/**
 * Represents the parameters for an API request path.
 * These parameters are part of the URL path.
 * @see https://expressjs.com/en/api.html#req.params
 */
export interface ApiRequestPathParam extends core.ParamsDictionary {
    /**
     * The type of investment.
     * @example "stock"
     */
    investmentType: string;
    /**
     * The type of bill.
     * @example "electricity"
     */
    billType: string;
    /**
     * The name of the provider.
     * @example "comcast"
     */
    provider: string;
}
