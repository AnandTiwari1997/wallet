import express, { Request, Response } from 'express';
import AsyncHandler from '../core/async-handler.js';
import { ApiResponseBody } from '../types/api-response-body.js';
import { SuccessResponse } from '../core/api-response.js';
import { ApiRequestBody } from '../types/api-request-body.js';
import { brokerRepository } from '../database/repository/broker-repository.js';
import { Broker } from '../database/models/broker.js';

const router = express.Router();
router.post(
    '/_search',
    AsyncHandler(async (req: Request<any, ApiResponseBody<Broker>, ApiRequestBody<Broker>>, res: Response<ApiResponseBody<Broker>>) => {
        let banks = await brokerRepository.findAll(req.body.criteria || {});
        let apiResponse: ApiResponseBody<Broker> = {
            num_found: banks.length,
            results: banks
        };
        return new SuccessResponse<ApiResponseBody<Broker>>(apiResponse).send(res);
    })
);
export default router;
