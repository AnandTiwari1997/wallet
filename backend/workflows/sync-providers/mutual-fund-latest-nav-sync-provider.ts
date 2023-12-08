import { SyncProvider } from './sync-provider.js';
import { mutualFundRepository } from '../../database/repository/mutual-fund-repository.js';
import fetch from 'node-fetch';
import { Logger } from '../../core/logger.js';

const logger: Logger = new Logger('MutualFundLatestNavSyncProvider');

class MutualFundLatestNavSyncProvider implements SyncProvider<String> {
    manualSync(funds: String[], deltaSync: boolean): void {
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
                logger.error(fund, error);
            }
        });
    }

    sync(): void {
        setInterval(
            () => {
                mutualFundRepository.findAllDistinctFundByISIN().then((funds) => {
                    this.manualSync(funds, false);
                });
            },
            1000 * 60 * 5
        );
    }
}

export const mutualFundNavSyncProvider = new MutualFundLatestNavSyncProvider();
