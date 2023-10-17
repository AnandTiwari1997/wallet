import * as core from 'express-serve-static-core';

export interface ApiRequestPathParam extends core.ParamsDictionary {
    investmentType: string;
    billType: string;
}
