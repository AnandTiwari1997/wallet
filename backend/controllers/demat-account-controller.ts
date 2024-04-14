import express, { Request, Response } from 'express';
import { AsyncApiHandler } from '../core/async-handler.js';
import { BadRequestError, InternalError } from '../core/api-error.js';
import { ApiRequestPathParam } from '../types/api-request-path-param.js';
import { ApiResponseBody } from '../types/api-response-body.js';
import { ApiRequestBody } from '../types/api-request-body.js';
import { SuccessResponse } from '../core/api-response.js';
import { RepositoryUtils } from '../database/util/repository-utils.js';
import { DematAccount } from '../database/models/demat-account.js';
import { dematAccountRepository } from '../database/repository/demat-account-repository.js';
import { dematAccountSyncHandler } from '../singleton.js';
import { HttpRequestLogger } from '../core/api-middleware.js';

const router = express.Router();
router.use(HttpRequestLogger);
router.post(
    '/_search',
    AsyncApiHandler(
        async (
            req: Request<ApiRequestPathParam, ApiResponseBody<DematAccount>, ApiRequestBody<DematAccount>>,
            res: Response<ApiResponseBody<DematAccount>>
        ) => {
            let where = RepositoryUtils.getWhereClause(req.body.criteria);
            let sort = RepositoryUtils.getSortClause(req.body.criteria);
            let groupBy = RepositoryUtils.getGroupByClause(req.body.criteria);
            const accounts = await dematAccountRepository.findWithGroupBy({
                where: where,
                order: sort,
                groupBy: groupBy,
                limit: req.body.criteria?.limit,
                offset: RepositoryUtils.getOffset(req.body.criteria)
            });
            let apiResponse: ApiResponseBody<DematAccount> = {
                num_found: accounts.length,
                results: accounts.map((account) => account)
            };
            return new SuccessResponse<ApiResponseBody<DematAccount>>(apiResponse).send(res);
        }
    )
);
router.post(
    '/',
    AsyncApiHandler(
        async (
            req: Request<ApiRequestPathParam, ApiResponseBody<DematAccount>, ApiRequestBody<DematAccount>>,
            res: Response<ApiResponseBody<DematAccount>>
        ) => {
            let clientAccount: DematAccount | undefined = req.body.data;
            if (!clientAccount) throw new BadRequestError('Invalid account provided');
            let inputAccount: DematAccount = Object.assign(DematAccount.prototype, clientAccount);
            if (!inputAccount) throw new BadRequestError('Invalid account details provided');
            let account = await dematAccountRepository.save(inputAccount);
            if (!account) throw new InternalError('Not able to add account');
            let apiResponse: ApiResponseBody<DematAccount> = {
                num_found: 1,
                results: [account]
            };
            dematAccountSyncHandler.sync([account], false);
            return new SuccessResponse<ApiResponseBody<DematAccount>>(apiResponse).send(res);
        }
    )
);
export default router;
