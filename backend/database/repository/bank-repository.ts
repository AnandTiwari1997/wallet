/**
 * @file Defines the repository for Bank entities.
 * @author anandt1@
 */

import { Bank } from '../models/bank.js';
import { databaseProvider } from '../database-provider.js';
import { DataSource, Repository } from 'typeorm';
import { FindManyOptionsExtended } from '../find-options/FindManyOptionsExtended.js';
import { SelectQueryBuilderExtended } from '../query-builder/SelectQueryBuilderExtended.js';
import { DriverUtils } from 'typeorm/driver/DriverUtils.js';

/**
 * Repository for handling database operations for Bank entities.
 * @extends Repository<Bank>
 */
class BankRepository extends Repository<Bank> {
    private readonly dataSource: DataSource;

    /**
     * Creates an instance of BankRepository.
     * @param {DataSource} dataSource - The TypeORM data source.
     */
    constructor(dataSource: DataSource) {
        super(Bank, dataSource.manager, dataSource.createQueryRunner());
        this.dataSource = dataSource;
    }

    /**
     * Creates an extended query builder for more complex queries.
     * @param {string} [alias] - The alias for the table.
     * @returns {SelectQueryBuilderExtended<Bank>} - The extended query builder.
     */
    createExtendedQueryBuilder(alias?: string): SelectQueryBuilderExtended<Bank> {
        let selectQueryBuilderExtended = new SelectQueryBuilderExtended<Bank>(this.dataSource, this.queryRunner);
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
     * @param {FindManyOptionsExtended<Bank>} options - The find options.
     * @returns {Promise<Bank[]>} - The found entities.
     */
    async findWithGroupBy(options: FindManyOptionsExtended<Bank>): Promise<Bank[]> {
        let queryBuilder = this.createExtendedQueryBuilder(this.metadata.targetName).setFindOptionsExtended(options);
        return await queryBuilder.getMany();
    }
}

/**
 * The singleton instance of the BankRepository.
 */
export const bankRepository = new BankRepository(databaseProvider.database);
