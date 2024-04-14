import express, { Request, Response } from 'express';
import { AsyncApiHandler } from '../core/async-handler.js';
import { ApiResponseBody } from '../types/api-response-body.js';
import { ApiRequestBody } from '../types/api-request-body.js';
import { SuccessResponse } from '../core/api-response.js';
import { holdingRepository } from '../database/repository/holding-repository.js';
import { Holding } from '../database/models/holding.js';
import { RepositoryUtils } from '../database/util/repository-utils.js';
import { HttpRequestLogger } from '../core/api-middleware.js';

const router = express.Router();
router.use(HttpRequestLogger);
router.post(
    '/_search',
    AsyncApiHandler(
        async (
            req: Request<any, ApiResponseBody<Holding>, ApiRequestBody<Holding>>,
            res: Response<ApiResponseBody<Holding>>
        ) => {
            let where = RepositoryUtils.getWhereClause(req.body.criteria);
            let sort = RepositoryUtils.getSortClause(req.body.criteria);
            let groupBy = RepositoryUtils.getGroupByClause(req.body.criteria);
            let stockHolding = await holdingRepository.findWithGroupBy({
                where: where,
                order: sort,
                groupBy: groupBy,
                limit: req.body.criteria?.limit,
                offset: RepositoryUtils.getOffset(req.body.criteria)
            });
            let apiResponse: ApiResponseBody<Holding> = {
                num_found: stockHolding.length,
                results: stockHolding
            };
            return new SuccessResponse<ApiResponseBody<Holding>>(apiResponse).send(res);
        }
    )
);
export default router;
