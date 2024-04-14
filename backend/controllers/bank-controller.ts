import { bankRepository } from '../database/repository/bank-repository.js';
import express, { Request, Response } from 'express';
import { AsyncApiHandler } from '../core/async-handler.js';
import { ApiResponseBody } from '../types/api-response-body.js';
import { SuccessResponse } from '../core/api-response.js';
import { Bank } from '../database/models/bank.js';
import { ApiRequestBody } from '../types/api-request-body.js';
import { RepositoryUtils } from '../database/util/repository-utils.js';
import { HttpRequestLogger } from '../core/api-middleware.js';

const router = express.Router();
router.use(HttpRequestLogger);
router.post(
    '/_search',
    AsyncApiHandler(
        async (
            req: Request<any, ApiResponseBody<Bank>, ApiRequestBody<Bank>>,
            res: Response<ApiResponseBody<Bank>>
        ) => {
            let where = RepositoryUtils.getWhereClause(req.body.criteria);
            let sort = RepositoryUtils.getSortClause(req.body.criteria);
            let groupBy = RepositoryUtils.getGroupByClause(req.body.criteria);
            let banks = await bankRepository.findWithGroupBy({
                where: where,
                order: sort,
                groupBy: groupBy,
                limit: req.body.criteria?.limit,
                offset: RepositoryUtils.getOffset(req.body.criteria)
            });
            let apiResponse: ApiResponseBody<Bank> = {
                num_found: banks.length,
                results: banks
            };
            return new SuccessResponse<ApiResponseBody<Bank>>(apiResponse).send(res);
        }
    )
);
export default router;
