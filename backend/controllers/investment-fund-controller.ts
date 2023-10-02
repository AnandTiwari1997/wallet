import { MUTUAL_FUND } from '../constant.js';
import { mutualFundStorage } from '../storage/mutual-fund-storage.js';
import { providentFundStorage } from '../storage/provident-fund-storage.js';
import { syncTrackerStorage } from '../storage/sync-tracker-storage.js';
import { dataChannel } from '../workflows/data-channel.js';
import { syncProviderHelper } from '../models/sync-provider.js';
import { captchaStorage } from '../storage/captcha-storage.js';

export const _getInvestmentTransactions = (req: any, res: any) => {
    if (req.params.investmentType === MUTUAL_FUND) {
        let result = mutualFundStorage.getAll(req.body.criteria || {});
        res.send({ results: result, num_found: result.length });
    } else {
        let result = providentFundStorage.getAll(req.body.criteria || {});
        res.send({ results: result, num_found: result.length });
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

export const _investmentSyncCaptcha = (req: any, res: any) => {
    captchaStorage.add({ captchaId: req.body.id, captchaText: req.body.captcha });
    res.sendStatus(200);
};
