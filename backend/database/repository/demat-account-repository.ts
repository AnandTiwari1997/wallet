/**
 * @file Defines the repository for DematAccount entities.
 * @author anandt1@
 */

import { Logger } from '../../core/logger.js';
import { DataSource, Repository } from 'typeorm';
import { DematAccount } from '../models/demat-account.js';
import { databaseProvider } from '../database-provider.js';
import { FindManyOptionsExtended } from '../find-options/FindManyOptionsExtended.js';
import { SelectQueryBuilderExtended } from '../query-builder/SelectQueryBuilderExtended.js';
import { DriverUtils } from 'typeorm/driver/DriverUtils.js';

// Logger for the DematAccountRepository.
const logger: Logger = new Logger('DematAccountRepository');

/**
 * Repository for handling database operations for DematAccount entities.
 * @extends Repository<DematAccount>
 */
class DematAccountRepository extends Repository<DematAccount> {
    private readonly dataSource: DataSource;

    /**
     * Creates an instance of DematAccountRepository.
     * @param {DataSource} dataSource - The TypeORM data source.
     */
    constructor(dataSource: DataSource) {
        super(DematAccount, dataSource.manager, dataSource.createQueryRunner());
        this.dataSource = dataSource;
    }

    /**
     * Creates an extended query builder for more complex queries.
     * @param {string} [alias] - The alias for the table.
     * @returns {SelectQueryBuilderExtended<DematAccount>} - The extended query builder.
     */
    createExtendedQueryBuilder(alias?: string): SelectQueryBuilderExtended<DematAccount> {
        let selectQueryBuilderExtended = new SelectQueryBuilderExtended<DematAccount>(
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
     * Finds entities with grouping based on the provided options.
     * @param {FindManyOptionsExtended<DematAccount>} options - The find options.
     * @returns {Promise<DematAccount[]>} - The found entities.
     */
    async findWithGroupBy(options: FindManyOptionsExtended<DematAccount>): Promise<DematAccount[]> {
        let queryBuilder = this.createExtendedQueryBuilder(this.metadata.targetName).setFindOptionsExtended(options);
        return await queryBuilder.getMany();
    }
}

/**
 * The singleton instance of the DematAccountRepository.
 */
export const dematAccountRepository = new DematAccountRepository(databaseProvider.database);
