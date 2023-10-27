import { bankRepository } from '../database/repository/bank-repository.js';
import express, { Request, Response } from 'express';
import AsyncHandler from '../core/async-handler.js';
import { ApiResponseBody } from '../types/api-response-body.js';
import { SuccessResponse } from '../core/api-response.js';
import { Bank } from '../database/models/bank.js';
import { ApiRequestBody } from '../types/api-request-body.js';

const router = express.Router();
router.post(
    '/_search',
    AsyncHandler(async (req: Request<any, ApiResponseBody<Bank>, ApiRequestBody<Bank>>, res: Response<ApiResponseBody<Bank>>) => {
        let banks = await bankRepository.findAll(req.body.criteria || {});
        let apiResponse: ApiResponseBody<Bank> = {
            num_found: banks.length,
            results: banks
        };
        return new SuccessResponse<ApiResponseBody<Bank>>(apiResponse).send(res);
    })
);
export default router;
