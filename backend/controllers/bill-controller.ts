import express, { Request, Response } from 'express';
import AsyncHandler from '../core/async-handler.js';
import { ApiResponseBody } from '../types/api-response-body.js';
import { ApiRequestBody } from '../types/api-request-body.js';
import { SuccessResponse } from '../core/api-response.js';
import { billRepository } from '../database/repository/bill-repository.js';
import { Bill } from '../database/models/bill.js';
import { BadRequestError, InternalError } from '../core/api-error.js';
import { ApiRequestPathParam } from '../types/api-request-path-param.js';
import { billSyncProvider } from '../workflows/sync-providers/bills-sync-provider.js';
import { electricityVendors } from '../config.js';

const router = express.Router();
router.post(
    '/_search',
    AsyncHandler(async (req: Request<ApiRequestPathParam, ApiResponseBody<Bill>, ApiRequestBody<Bill>>, res: Response<ApiResponseBody<Bill>>) => {
        let bills = await billRepository.findAll(req.body.criteria || {});
        let apiResponse: ApiResponseBody<Bill> = {
            num_found: bills.length,
            results: bills
        };
        return new SuccessResponse<ApiResponseBody<Bill>>(apiResponse).send(res);
    })
);
router.post(
    '/',
    AsyncHandler(async (req: Request<any, ApiResponseBody<Bill>, ApiRequestBody<Bill>>, res: Response<ApiResponseBody<Bill>>) => {
        let bill = req.body.data;
        if (!bill) throw new BadRequestError('Invalid data provided to add.');
        let newBill = await billRepository.add(bill);
        if (!newBill) throw new InternalError('Internal Error Occurred while adding bill');
        let apiResponse: ApiResponseBody<Bill> = {
            num_found: 1,
            results: [newBill]
        };
        billSyncProvider.manualSync([newBill], false);
        return new SuccessResponse<ApiResponseBody<Bill>>(apiResponse).send(res);
    })
);
router.put(
    '/',
    AsyncHandler(async (req: Request<any, ApiResponseBody<Bill>, ApiRequestBody<Bill>>, res: Response<ApiResponseBody<Bill>>) => {
        let bill = req.body.data;
        if (!bill) throw new BadRequestError('Invalid data provided to add.');
        let updatedBill = await billRepository.update(bill);
        if (!updatedBill) throw new InternalError('Internal Error Occurred while updating bill');
        let apiResponse: ApiResponseBody<Bill> = {
            num_found: 1,
            results: [updatedBill]
        };
        return new SuccessResponse<ApiResponseBody<Bill>>(apiResponse).send(res);
    })
);
router.get(
    '/electricity/vendors',
    AsyncHandler(async (req: Request<any, ApiResponseBody<{ value: string; label: string }>, ApiRequestBody<Bill>>, res: Response<ApiResponseBody<{ value: string; label: string }>>) => {
        let apiResponse: ApiResponseBody<{ value: string; label: string }> = {
            num_found: electricityVendors.length,
            results: electricityVendors
        };
        return new SuccessResponse<ApiResponseBody<{ value: string; label: string }>>(apiResponse).send(res);
    })
);
export default router;
