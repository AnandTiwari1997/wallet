import { Logger } from '../../core/logger.js';
import { DataSource, Repository } from 'typeorm';
import { ProvidentFundTransaction } from '../models/provident-fund-transaction.js';
import { databaseProvider } from '../database-provider.js';
import { FindManyOptionsExtended } from '../find-options/FindManyOptionsExtended.js';
import { SelectQueryBuilderExtended } from '../query-builder/SelectQueryBuilderExtended.js';
import { DriverUtils } from 'typeorm/driver/DriverUtils.js';
import { MutualFundTransaction } from '../models/mutual-fund-transaction.js';

const logger: Logger = new Logger('ProvidentFundRepository');

class ProvidentFundRepository extends Repository<ProvidentFundTransaction> {
    private readonly dataSource: DataSource;

    constructor(dataSource: DataSource) {
        super(ProvidentFundTransaction, dataSource.manager, dataSource.createQueryRunner());
        this.dataSource = dataSource;
    }

    createExtendedQueryBuilder(alias?: string): SelectQueryBuilderExtended<ProvidentFundTransaction> {
        let selectQueryBuilderExtended = new SelectQueryBuilderExtended<ProvidentFundTransaction>(
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
                financial_year: true
            }
        });
        return (await innerQuery.getRawMany()).length;
    }

    async findWithGroupBy(
        options: FindManyOptionsExtended<ProvidentFundTransaction>
    ): Promise<ProvidentFundTransaction[]> {
        try {
            let innerQuery = this.createExtendedQueryBuilder(this.metadata.targetName);
            innerQuery.select('financial_year');
            innerQuery.addGroupBy('financial_year');
            let finalQuery = this.createExtendedQueryBuilder(this.metadata.targetName);
            finalQuery.where(`financial_year IN (${innerQuery.getQuery()})`);
            finalQuery.setFindOptions({
                where: options.where,
                order: options.order
            });
            return finalQuery.getMany();
        } catch (error) {
            logger.error(`[findWithGroupBy] - Error On findWithGroupBy ${error}`);
            return [];
        }
    }
}

export const providentFundRepository = new ProvidentFundRepository(databaseProvider.database);
