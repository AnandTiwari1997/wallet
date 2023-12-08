import express, { Request, Response } from 'express';
import AsyncHandler from '../core/async-handler.js';
import { ApiResponseBody } from '../types/api-response-body.js';
import { SuccessResponse } from '../core/api-response.js';
import { ApiRequestBody } from '../types/api-request-body.js';
import { holdingRepository } from '../database/repository/holding-repository.js';
import { Holding } from '../database/models/holding.js';

const router = express.Router();
router.post(
    '/_search',
    AsyncHandler(async (req: Request<any, ApiResponseBody<Holding>, ApiRequestBody<Holding>>, res: Response<ApiResponseBody<Holding>>) => {
        let stockHolding = await holdingRepository.findAll(req.body.criteria || {});
        let apiResponse: ApiResponseBody<Holding> = {
            num_found: stockHolding.length,
            results: stockHolding
        };
        return new SuccessResponse<ApiResponseBody<Holding>>(apiResponse).send(res);
    })
);
export default router;
