import express, { Request, Response } from 'express';
import { AsyncApiHandler } from '../core/async-handler.js';
import { ApiResponseBody } from '../types/api-response-body.js';
import { ApiRequestBody } from '../types/api-request-body.js';
import { SuccessResponse } from '../core/api-response.js';
import { billRepository } from '../database/repository/bill-repository.js';
import { Bill } from '../database/models/bill.js';
import { BadRequestError, InternalError } from '../core/api-error.js';
import { ApiRequestPathParam } from '../types/api-request-path-param.js';
import { electricityVendors } from '../config.js';
import { RepositoryUtils } from '../database/util/repository-utils.js';
import { billsSyncHandler } from '../singleton.js';
import { HttpRequestLogger } from '../core/api-middleware.js';

const router = express.Router();
router.use(HttpRequestLogger);
router.post(
    '/_search',
    AsyncApiHandler(
        async (
            req: Request<ApiRequestPathParam, ApiResponseBody<Bill>, ApiRequestBody<Bill>>,
            res: Response<ApiResponseBody<Bill>>
        ) => {
            let where = RepositoryUtils.getWhereClause(req.body.criteria);
            let sort = RepositoryUtils.getSortClause(req.body.criteria);
            let groupBy = RepositoryUtils.getGroupByClause(req.body.criteria);
            let bills = await billRepository.findWithGroupBy({
                where: where,
                order: sort,
                groupBy: groupBy,
                limit: req.body.criteria?.limit,
                offset: RepositoryUtils.getOffset(req.body.criteria)
            });
            let apiResponse: ApiResponseBody<Bill> = {
                num_found: bills.length,
                results: bills
            };
            return new SuccessResponse<ApiResponseBody<Bill>>(apiResponse).send(res);
        }
    )
);
router.post(
    '/',
    AsyncApiHandler(
        async (
            req: Request<any, ApiResponseBody<Bill>, ApiRequestBody<Bill>>,
            res: Response<ApiResponseBody<Bill>>
        ) => {
            let bill = req.body.data;
            if (!bill) throw new BadRequestError('Invalid data provided to add.');
            let newBill = await billRepository.save(bill);
            if (!newBill) throw new InternalError('Internal Error Occurred while adding bill');
            let apiResponse: ApiResponseBody<Bill> = {
                num_found: 1,
                results: [newBill]
            };
            billsSyncHandler.sync([newBill], false);
            return new SuccessResponse<ApiResponseBody<Bill>>(apiResponse).send(res);
        }
    )
);
router.put(
    '/',
    AsyncApiHandler(
        async (
            req: Request<any, ApiResponseBody<Bill>, ApiRequestBody<Bill>>,
            res: Response<ApiResponseBody<Bill>>
        ) => {
            let bill = req.body.data;
            if (!bill) throw new BadRequestError('Invalid data provided to add.');
            let updateResult = await billRepository.update(bill.bill_id, bill);
            if (!updateResult.affected) throw new InternalError('Internal Error Occurred while updating bill');
            let updatedBill = await billRepository.find({ where: { bill_id: bill.bill_id } });
            let apiResponse: ApiResponseBody<Bill> = {
                num_found: 1,
                results: [updatedBill[0]]
            };
            return new SuccessResponse<ApiResponseBody<Bill>>(apiResponse).send(res);
        }
    )
);
router.get(
    '/electricity/vendors',
    AsyncApiHandler(
        async (
            req: Request<
                any,
                ApiResponseBody<{
                    value: string;
                    label: string;
                }>,
                ApiRequestBody<Bill>
            >,
            res: Response<ApiResponseBody<{ value: string; label: string }>>
        ) => {
            let apiResponse: ApiResponseBody<{ value: string; label: string }> = {
                num_found: electricityVendors.length,
                results: electricityVendors
            };
            return new SuccessResponse<ApiResponseBody<{ value: string; label: string }>>(apiResponse).send(res);
        }
    )
);
export default router;
