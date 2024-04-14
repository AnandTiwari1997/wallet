import express, { Request, Response } from 'express';
import { brokerRepository } from '../database/repository/broker-repository.js';
import { RepositoryUtils } from '../database/util/repository-utils.js';
import { AsyncApiHandler } from '../core/async-handler.js';
import { ApiResponseBody } from '../types/api-response-body.js';
import { ApiRequestBody } from '../types/api-request-body.js';
import { Broker } from '../database/models/broker.js';
import { SuccessResponse } from '../core/api-response.js';
import { HttpRequestLogger } from '../core/api-middleware.js';

const router = express.Router();
router.use(HttpRequestLogger);
router.post(
    '/_search',
    AsyncApiHandler(
        async (
            req: Request<any, ApiResponseBody<Broker>, ApiRequestBody<Broker>>,
            res: Response<ApiResponseBody<Broker>>
        ) => {
            let where = RepositoryUtils.getWhereClause(req.body.criteria);
            let sort = RepositoryUtils.getSortClause(req.body.criteria);
            let groupBy = RepositoryUtils.getGroupByClause(req.body.criteria);
            let banks = await brokerRepository.findWithGroupBy({
                where: where,
                order: sort,
                groupBy: groupBy,
                limit: req.body.criteria?.limit,
                offset: RepositoryUtils.getOffset(req.body.criteria)
            });
            let apiResponse: ApiResponseBody<Broker> = {
                num_found: banks.length,
                results: banks
            };
            return new SuccessResponse<ApiResponseBody<Broker>>(apiResponse).send(res);
        }
    )
);
export default router;
