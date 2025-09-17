/**
 * @file Defines the repository for Bill entities.
 * @author anandt1@
 */

import { Bill } from '../models/bill.js';
import { Logger } from '../../core/logger.js';
import { DataSource, Repository } from 'typeorm';
import { databaseProvider } from '../database-provider.js';
import { FindManyOptionsExtended } from '../find-options/FindManyOptionsExtended.js';
import { SelectQueryBuilderExtended } from '../query-builder/SelectQueryBuilderExtended.js';
import { DriverUtils } from 'typeorm/driver/DriverUtils.js';

// Logger for the BillRepository.
const logger: Logger = new Logger('BillRepository');

/**
 * Repository for handling database operations for Bill entities.
 * @extends Repository<Bill>
 */
class BillRepository extends Repository<Bill> {
    private readonly dataSource: DataSource;

    /**
     * Creates an instance of BillRepository.
     * @param {DataSource} dataSource - The TypeORM data source.
     */
    constructor(dataSource: DataSource) {
        super(Bill, dataSource.manager, dataSource.createQueryRunner());
        this.dataSource = dataSource;
    }

    /**
     * Creates an extended query builder for more complex queries.
     * @param {string} [alias] - The alias for the table.
     * @returns {SelectQueryBuilderExtended<Bill>} - The extended query builder.
     */
    createExtendedQueryBuilder(alias?: string): SelectQueryBuilderExtended<Bill> {
        let selectQueryBuilderExtended = new SelectQueryBuilderExtended<Bill>(this.dataSource, this.queryRunner);
        if (alias) {
            let alias_ = DriverUtils.buildAlias(this.dataSource.driver, undefined, alias);
            selectQueryBuilderExtended.select(alias_).from(this.metadata.target, alias_);
            return selectQueryBuilderExtended;
        } else {
            return selectQueryBuilderExtended;
        }
    }

    /**
     * Finds entities with grouping based on the provided options.
     * @param {FindManyOptionsExtended<Bill>} options - The find options.
     * @returns {Promise<Bill[]>} - The found entities.
     */
    async findWithGroupBy(options: FindManyOptionsExtended<Bill>): Promise<Bill[]> {
        let queryBuilder = this.createExtendedQueryBuilder(this.metadata.targetName).setFindOptionsExtended(options);
        return queryBuilder.getMany();
    }
}

/**
 * The singleton instance of the BillRepository.
 */
export const billRepository = new BillRepository(databaseProvider.database);
