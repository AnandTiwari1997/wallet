import { Logger } from '../../core/logger.js';
import { DataSource, Repository } from 'typeorm';
import { databaseProvider } from '../database-provider.js';
import { MutualFundTransaction } from '../models/mutual-fund-transaction.js';
import { FindManyOptionsExtended } from '../find-options/FindManyOptionsExtended.js';
import { SelectQueryBuilderExtended } from '../query-builder/SelectQueryBuilderExtended.js';
import { DriverUtils } from 'typeorm/driver/DriverUtils.js';

const logger: Logger = new Logger('MutualFundRepository');

class MutualFundRepository extends Repository<MutualFundTransaction> {
    private readonly dataSource: DataSource;

    constructor(dataSource: DataSource) {
        super(MutualFundTransaction, dataSource.manager, dataSource.createQueryRunner());
        this.dataSource = dataSource;
    }

    createExtendedQueryBuilder(alias?: string): SelectQueryBuilderExtended<MutualFundTransaction> {
        let selectQueryBuilderExtended = new SelectQueryBuilderExtended<MutualFundTransaction>(
            this.dataSource,
            this.queryRunner
        );
        if (alias) {
            let alias_ = DriverUtils.buildAlias(this.dataSource.driver, undefined, alias);
            selectQueryBuilderExtended.select(alias_).from(this.metadata.target, alias_);
            return selectQueryBuilderExtended;
        } else {
            return selectQueryBuilderExtended;
        }
    }

    async countWithGroupBy(options: FindManyOptionsExtended<MutualFundTransaction>): Promise<number> {
        let innerQuery = this.createExtendedQueryBuilder(this.metadata.targetName);
        innerQuery.select('COUNT(1)');
        innerQuery.setFindOptionsExtended({
            where: options.where,
            groupBy: {
                fund_name: true
            }
        });
        return (await innerQuery.getRawMany()).length;
    }

    async findWithGroupBy(options: FindManyOptionsExtended<MutualFundTransaction>): Promise<MutualFundTransaction[]> {
        try {
            let innerQuery = this.createExtendedQueryBuilder(this.metadata.targetName);
            innerQuery.select('fund_name');
            innerQuery.addGroupBy('fund_name');
            let finalQuery = this.createExtendedQueryBuilder(this.metadata.targetName);
            finalQuery.where(`fund_name IN (${innerQuery.getQuery()})`);
            finalQuery.setFindOptionsExtended({
                order: options.order,
                where: options.where
            });
            return finalQuery.getMany();
        } catch (error) {
            logger.error(`[findWithGroupBy] - Error On findWithGroupBy ${error}`);
            return [];
        }
    }

    async findAllDistinctFundByISIN(): Promise<string[]> {
        try {
            let queryResult = await this.createQueryBuilder().select('isin').groupBy('isin').getRawMany<{
                isin: string;
            }>();
            return queryResult.map((value) => value.isin);
        } catch (error) {
            logger.error(`[Count] - Error On FindAllDistinctFundByISIN ${error}`);
            return [];
        }
    }

    async updateByISIN(isin: string, latestNAV: number): Promise<number | undefined> {
        try {
            let result = await this.createQueryBuilder()
                .update()
                .set({ nav: latestNAV })
                .where('isin = :isin', { isin: isin })
                .execute();
            return result.affected;
        } catch (error) {
            logger.error(`[Count] - Error On FindAllDistinctFundByISIN ${error}`);
            return 0;
        }
    }
}

export const mutualFundRepository = new MutualFundRepository(databaseProvider.database);
