import { accountTransactionRepository } from '../database/repository/account-transaction-repository.js';
import { Transaction } from '../database/models/account-transaction.js';
import express, { Request, Response } from 'express';
import AsyncHandler from '../core/async-handler.js';
import { ApiResponseBody } from '../types/api-response-body.js';
import { ApiRequestBody } from '../types/api-request-body.js';
import { SuccessResponse } from '../core/api-response.js';
import { ApiRequestPathParam } from '../types/api-request-path-param.js';

const router = express.Router();
router.post(
    '/',
    AsyncHandler(async (req: Request<ApiRequestPathParam, ApiResponseBody<Transaction>, ApiRequestBody<Transaction>>, res: Response<ApiResponseBody<Transaction>>) => {
        let transactions = await accountTransactionRepository.findAllUsingGroupBy(req.body.criteria || {});
        let count = await accountTransactionRepository.count(req.body.criteria || {});
        let apiResponse: ApiResponseBody<Transaction> = {
            num_found: count,
            results: transactions
        };
        return new SuccessResponse<ApiResponseBody<Transaction>>(apiResponse).send(res);
    })
);
export default router;
