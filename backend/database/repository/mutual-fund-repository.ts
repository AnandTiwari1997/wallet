/**
 * @file Defines the repository for MutualFundTransaction entities.
 * @author anandt1@
 */

import { Logger } from '../../core/logger.js';
import { DataSource, Repository } from 'typeorm';
import { databaseProvider } from '../database-provider.js';
import { MutualFundTransaction } from '../models/mutual-fund-transaction.js';
import { FindManyOptionsExtended } from '../find-options/FindManyOptionsExtended.js';
import { SelectQueryBuilderExtended } from '../query-builder/SelectQueryBuilderExtended.js';
import { DriverUtils } from 'typeorm/driver/DriverUtils.js';

// Logger for the MutualFundRepository.
const logger: Logger = new Logger('MutualFundRepository');

/**
 * Repository for handling database operations for MutualFundTransaction entities.
 * @extends Repository<MutualFundTransaction>
 */
class MutualFundRepository extends Repository<MutualFundTransaction> {
    private readonly dataSource: DataSource;

    /**
     * Creates an instance of MutualFundRepository.
     * @param {DataSource} dataSource - The TypeORM data source.
     */
    constructor(dataSource: DataSource) {
        super(MutualFundTransaction, dataSource.manager, dataSource.createQueryRunner());
        this.dataSource = dataSource;
    }

    /**
     * Creates an extended query builder for more complex queries.
     * @param {string} [alias] - The alias for the table.
     * @returns {SelectQueryBuilderExtended<MutualFundTransaction>} - The extended query builder.
     */
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
                fund_name: true
            }
        });
        return (await innerQuery.getRawMany()).length;
    }

    /**
     * Finds entities with grouping based on the provided options.
     * @param {FindManyOptionsExtended<MutualFundTransaction>} options - The find options.
     * @returns {Promise<MutualFundTransaction[]>} - The found entities.
     */
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

    /**
     * Finds all distinct fund ISINs.
     * @returns {Promise<string[]>} - A list of distinct ISINs.
     */
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

    /**
     * Updates the NAV for a given ISIN.
     * @param {string} isin - The ISIN of the fund to update.
     * @param {number} latestNAV - The latest NAV.
     * @returns {Promise<number | undefined>} - The number of affected rows.
     */
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

/**
 * The singleton instance of the MutualFundRepository.
 */
export const mutualFundRepository = new MutualFundRepository(databaseProvider.database);
