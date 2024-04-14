import fetch from 'node-fetch';
import { IScheduler } from './scheduler.js';
import { Logger } from '../core/logger.js';
import { mutualFundRepository } from '../database/repository/mutual-fund-repository.js';

const logger: Logger = new Logger('MutualFundLatestNavScheduler');

export class MutualFundLatestNavScheduler implements IScheduler<string> {
    schedule(intervalInMS: number = 1000 * 60 * 60 * 12): void {
        this.sync();
        setInterval(this.sync, intervalInMS);
    }

    private sync(): void {
        logger.info(`Mutual Fund Sync Started`);
        mutualFundRepository.findAllDistinctFundByISIN().then((funds: string[]) => {
            funds.forEach(async (fund) => {
                try {
                    let url = `https://www.moneycontrol.com/mc/widget/mfnavonetimeinvestment/get_chart_value?isin=${fund}&dur=1W`;
                    let response = await fetch(url);
                    if (response) {
                        let data: any = await response.json();
                        let graphData = data['g1'];
                        let nav = Number.parseFloat(graphData[graphData.length - 1]['navValueAdjusted']);
                        await mutualFundRepository.updateByISIN(fund, nav);
                    } else {
                        logger.debug(response);
                    }
                } catch (error) {
                    logger.error('NAV Refresh failed for fund', fund);
                }
            });
        });
    }
}
