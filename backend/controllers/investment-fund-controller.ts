import { MUTUAL_FUND, PROVIDENT_FUND } from '../constant.js';
import { mutualFundRepository } from '../database/repository/mutual-fund-repository.js';
import { providentFundRepository } from '../database/repository/provident-fund-repository.js';
import { syncTrackerStorage } from '../database/repository/sync-tracker-storage.js';
import { dataChannel } from '../workflows/data-channel.js';
import { syncProviderHelper } from '../workflows/sync-providers/sync-provider.js';
import { captchaStorage } from '../database/repository/captcha-storage.js';
import express, { Request, Response } from 'express';
import AsyncHandler from '../core/async-handler.js';
import { ApiResponseBody } from '../types/api-response-body.js';
import { ApiRequestBody } from '../types/api-request-body.js';
import { MutualFundTransaction } from '../database/models/mutual-fund-transaction.js';
import { ProvidentFundTransaction } from '../database/models/provident-fund-transaction.js';
import { ApiRequestPathParam } from '../types/api-request-path-param.js';
import { SuccessResponse } from '../core/api-response.js';

const router = express.Router();

interface Captcha {
    id: string;
    captcha: string;
}

const getFundStorage = (type: string) => {
    switch (type) {
        case MUTUAL_FUND:
            return mutualFundRepository;
        case PROVIDENT_FUND:
            return providentFundRepository;
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
        syncProviderHelper(req.params.investmentType);
        syncTrackerStorage.add({
            syncType: req.params.investmentType,
            startTime: new Date(),
            status: 'IN_PROGRESS'
        });
    }
};
router.get('/:investmentType/sync', _syncInvestment);
router.post(
    '/:investmentType/transactions',
    AsyncHandler(
        async (
            req: Request<ApiRequestPathParam, ApiResponseBody<MutualFundTransaction | ProvidentFundTransaction>, ApiRequestBody<MutualFundTransaction | ProvidentFundTransaction>>,
            res: Response<ApiResponseBody<MutualFundTransaction | ProvidentFundTransaction>>
        ) => {
            console.log(req.params);
            let fundStorage: any = getFundStorage(req.params.investmentType);
            let result = await fundStorage.findAllUsingGroupBy(req.body.criteria || {});
            let count = await fundStorage.count(req.body.criteria || {});
            let apiResponse: ApiResponseBody<MutualFundTransaction | ProvidentFundTransaction> = {
                num_found: count,
                results: result
            };
            return new SuccessResponse<ApiResponseBody<MutualFundTransaction | ProvidentFundTransaction>>(apiResponse).send(res);
        }
    )
);
router.post(
    '/:investmentType/sync/captcha',
    AsyncHandler(
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
