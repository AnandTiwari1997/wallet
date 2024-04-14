import express, { Request, Response } from 'express';
import { AsyncApiHandler } from '../core/async-handler.js';
import { ApiRequestPathParam } from '../types/api-request-path-param.js';
import { ApiResponseBody } from '../types/api-response-body.js';
import { ApiRequestBody } from '../types/api-request-body.js';
import { SuccessResponse } from '../core/api-response.js';
import { MUTUAL_FUND } from '../constant.js';
import { mutualFundRepository } from '../database/repository/mutual-fund-repository.js';
import { providentFundRepository } from '../database/repository/provident-fund-repository.js';
import { syncTrackerStorage } from '../database/repository/sync-tracker-storage.js';
import { dataChannel } from '../utils/data-channel-util.js';
import { MutualFundTransaction } from '../database/models/mutual-fund-transaction.js';
import { ProvidentFundTransaction } from '../database/models/provident-fund-transaction.js';
import { StockTransaction } from '../database/models/stock-transaction.js';
import { captchaStorage } from '../database/repository/captcha-storage.js';
import { RepositoryUtils } from '../database/util/repository-utils.js';
import { MutualFundSyncHandler } from '../sync-handlers/mutual-fund-sync-handler.js';
import { ProvidentFundSyncHandler } from '../sync-handlers/provident-fund-sync-handler.js';
import { HttpRequestLogger } from '../core/api-middleware.js';

const router = express.Router();
router.use(HttpRequestLogger);

interface Captcha {
    id: string;
    captcha: string;
}

const getFundStorage = (type: string) => {
    switch (type) {
        case MUTUAL_FUND:
            return mutualFundRepository;
        default:
            return providentFundRepository;
    }
};

const getSyncHandler = (type: string) => {
    switch (type) {
        case MUTUAL_FUND:
            return new MutualFundSyncHandler();
        default:
            return new ProvidentFundSyncHandler();
    }
};
export const _syncInvestment = (req: any, res: any) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
    }).flushHeaders();
    if (syncTrackerStorage.isSyncInProgress(req.params.investmentType)) {
        res.write(
            `data: ${JSON.stringify({
                message: `Your ${req.params.investmentType} investment are already being synced`,
                type: 'ping'
            })}\n\n`
        );
        res.send();
    } else {
        res.write(
            `data: ${JSON.stringify({
                message: `Your ${req.params.investmentType} investment are being synced`,
                type: 'ping'
            })}\n\n`
        );
        if (req.params.investmentType === MUTUAL_FUND) res.end();
        else dataChannel.register('sync', res);
        getSyncHandler(req.params.investmentType).sync();
        syncTrackerStorage.add({
            syncType: req.params.investmentType,
            startTime: new Date(),
            status: 'IN_PROGRESS'
        });
    }
};
router.get('/:investmentType/sync', _syncInvestment);
router.post(
    '/:investmentType/transaction',
    AsyncApiHandler(
        async (
            req: Request<
                ApiRequestPathParam,
                ApiResponseBody<MutualFundTransaction | ProvidentFundTransaction | StockTransaction>,
                ApiRequestBody<MutualFundTransaction | ProvidentFundTransaction | StockTransaction>
            >,
            res: Response<ApiResponseBody<MutualFundTransaction | ProvidentFundTransaction>>
        ) => {
            let fundStorage = getFundStorage(req.params.investmentType);
            if (!fundStorage) return;
            let where = RepositoryUtils.getWhereClause(req.body.criteria);
            let sort = RepositoryUtils.getSortClause(req.body.criteria);
            let groupBy = RepositoryUtils.getGroupByClause(req.body.criteria);
            let result = await fundStorage.findWithGroupBy({
                where: where,
                order: sort,
                groupBy: groupBy,
                limit: req.body.criteria?.limit,
                offset: RepositoryUtils.getOffset(req.body.criteria)
            });
            let count = await fundStorage.countWithGroupBy({
                where: where,
                order: sort
            });
            let apiResponse: ApiResponseBody<MutualFundTransaction | ProvidentFundTransaction> = {
                num_found: count,
                results: result
            };
            return new SuccessResponse<
                ApiResponseBody<MutualFundTransaction | ProvidentFundTransaction | StockTransaction>
            >(apiResponse).send(res);
        }
    )
);
router.post(
    '/:investmentType/sync/captcha',
    AsyncApiHandler(
        async (
            req: Request<ApiRequestPathParam, { message: string }, ApiRequestBody<Captcha>>,
            res: Response<{
                message: string;
            }>
        ) => {
            captchaStorage.add({ captchaId: req.body.data?.id || '', captchaText: req.body.data?.captcha });
            return new SuccessResponse<{ message: string }>({ message: 'Captcha Inserted' }).send(res);
        }
    )
);
export default router;
