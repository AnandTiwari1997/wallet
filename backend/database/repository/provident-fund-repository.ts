/**
 * @file Defines the repository for ProvidentFundTransaction entities.
 * @author anandt1@
 */

import { Logger } from '../../core/logger.js';
import { DataSource, Repository } from 'typeorm';
import { ProvidentFundTransaction } from '../models/provident-fund-transaction.js';
import { databaseProvider } from '../database-provider.js';
import { FindManyOptionsExtended } from '../find-options/FindManyOptionsExtended.js';
import { SelectQueryBuilderExtended } from '../query-builder/SelectQueryBuilderExtended.js';
import { DriverUtils } from 'typeorm/driver/DriverUtils.js';
import { MutualFundTransaction } from '../models/mutual-fund-transaction.js';

// Logger for the ProvidentFundRepository.
const logger: Logger = new Logger('ProvidentFundRepository');

/**
 * Repository for handling database operations for ProvidentFundTransaction entities.
 * @extends Repository<ProvidentFundTransaction>
 */
class ProvidentFundRepository extends Repository<ProvidentFundTransaction> {
    private readonly dataSource: DataSource;

    /**
     * Creates an instance of ProvidentFundRepository.
     * @param {DataSource} dataSource - The TypeORM data source.
     */
    constructor(dataSource: DataSource) {
        super(ProvidentFundTransaction, dataSource.manager, dataSource.createQueryRunner());
        this.dataSource = dataSource;
    }

    /**
     * Creates an extended query builder for more complex queries.
     * @param {string} [alias] - The alias for the table.
     * @returns {SelectQueryBuilderExtended<ProvidentFundTransaction>} - The extended query builder.
     */
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

    /**
     * Counts the number of groups based on the provided options.
     * @param {FindManyOptionsExtended<MutualFundTransaction>} options - The find options.
     * @returns {Promise<number>} - The number of groups.
     */
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

    /**
     * Finds entities with grouping based on the provided options.
     * @param {FindManyOptionsExtended<ProvidentFundTransaction>} options - The find options.
     * @returns {Promise<ProvidentFundTransaction[]>} - The found entities.
     */
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

/**
 * The singleton instance of the ProvidentFundRepository.
 */
export const providentFundRepository = new ProvidentFundRepository(databaseProvider.database);
