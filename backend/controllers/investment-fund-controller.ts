import express, { Request, Response } from 'express';
import { AsyncApiHandler } from '../core/api-handler.js';
import { ApiRequestPathParam } from '../types/api-request-path-param.js';
import { ApiResponseBody } from '../types/api-response-body.js';
import { ApiRequestBody } from '../types/api-request-body.js';
import { SuccessResponse } from '../core/api-response.js';
import { MUTUAL_FUND } from '../constant.js';
import { mutualFundRepository } from '../database/repository/mutual-fund-repository.js';
import { providentFundRepository } from '../database/repository/provident-fund-repository.js';
import { dataChannel } from '../utils/data-channel-util.js';
import { MutualFundTransaction } from '../database/models/mutual-fund-transaction.js';
import { ProvidentFundTransaction } from '../database/models/provident-fund-transaction.js';
import { captchaStorage } from '../database/repository/captcha-storage.js';
import { RepositoryUtils } from '../database/util/repository-utils.js';
import { MutualFundSyncHandler } from '../sync-handlers/mutual-fund-sync-handler.js';
import { ProvidentFundSyncHandler } from '../sync-handlers/provident-fund-sync-handler.js';
import { HttpRequestLogger } from '../core/api-middleware.js';
import { syncTrackerRepository } from '../database/repository/sync-tracker-repository.js';
import { SyncTracker } from '../database/models/sync-tracker.js';
import { BadRequestError } from '../core/api-error.js';

const router = express.Router();
router.use(HttpRequestLogger);

interface Input {
    id: string;
    text: string;
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
export const _syncInvestment = async (req: any, res: any) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
    }).flushHeaders();

    let syncTracker = await syncTrackerRepository.findOne({
        where: {
            sync_type: req.params.investmentType,
            sync_status: 'IN_PROGRESS'
        }
    });

    if (syncTracker) {
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
        syncTrackerRepository
            .save(new SyncTracker(req.params.investmentType, 'IN_PROGRESS', new Date()))
            .then((r) => {});
        setTimeout(
            async () => {
                let syncTracker = await syncTrackerRepository.findOne({
                    where: {
                        sync_type: req.params.investmentType
                    }
                });
                if (syncTracker?.sync_status === 'IN_PROGRESS') {
                    syncTracker.sync_status = 'FAILED';
                    syncTracker.sync_ended_at = new Date();
                    syncTrackerRepository.update(syncTracker.sync_type, syncTracker).then((r) => {});
                }
            },
            1000 * 60 * 31
        );
    }
};
router.get('/:investmentType/sync', _syncInvestment);
router.post(
    '/:investmentType/transaction',
    AsyncApiHandler(
        async (
            req: Request<
                ApiRequestPathParam,
                ApiResponseBody<MutualFundTransaction | ProvidentFundTransaction>,
                ApiRequestBody<MutualFundTransaction | ProvidentFundTransaction>
            >,
            res: Response<ApiResponseBody<MutualFundTransaction | ProvidentFundTransaction>>
        ) => {
            let fundStorage = getFundStorage(req.params.investmentType);
            if (!fundStorage) throw new BadRequestError('Invalid transaction provided');
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
            return new SuccessResponse<ApiResponseBody<MutualFundTransaction | ProvidentFundTransaction>>(
                apiResponse
            ).send(res);
        }
    )
);
router.post(
    '/:investmentType/sync/captcha',
    AsyncApiHandler(
        async (
            req: Request<ApiRequestPathParam, { message: string }, ApiRequestBody<Input>>,
            res: Response<{
                message: string;
            }>
        ) => {
            captchaStorage.add({ id: req.body.data?.id || '', text: req.body.data?.text });
            return new SuccessResponse<{ message: string }>({ message: 'Captcha/OTP Inserted' }).send(res);
        }
    )
);
export default router;
