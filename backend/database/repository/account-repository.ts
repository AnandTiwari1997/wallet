/**
 * @file defines the account repository
 * @author anand
 */

import { Account } from '../models/account.js';
import { databaseProvider } from '../database-provider.js';
import { DataSource, Repository } from 'typeorm';
import { Logger } from '../../core/logger.js';
import { FindManyOptionsExtended } from '../find-options/FindManyOptionsExtended.js';
import { SelectQueryBuilderExtended } from '../query-builder/SelectQueryBuilderExtended.js';
import { DriverUtils } from 'typeorm/driver/DriverUtils.js';

// Logger for the account repository
const logger: Logger = new Logger('AccountRepository');

/**
 * @class
 * @classdesc a class to handle all account related database operations
 * @extends {Repository<Account>}
 */
class AccountRepository extends Repository<Account> {
    private readonly dataSource: DataSource;

    /**
     * @constructor
     * @param {DataSource} dataSource the data source
     */
    constructor(dataSource: DataSource) {
        super(Account, dataSource.manager, dataSource.createQueryRunner());
        this.dataSource = dataSource;
    }

    /**
     * Creates an extended query builder
     *
     * @param {?string} alias the alias to use
     * @returns {SelectQueryBuilderExtended<Account>} the extended query builder
     */
    createExtendedQueryBuilder(alias?: string): SelectQueryBuilderExtended<Account> {
        let selectQueryBuilderExtended = new SelectQueryBuilderExtended<Account>(this.dataSource, this.queryRunner);
        if (alias) {
            let alias_ = DriverUtils.buildAlias(this.dataSource.driver, undefined, alias);
            selectQueryBuilderExtended.select(alias_).from(this.metadata.target, alias_);
            return selectQueryBuilderExtended;
        } else {
            return selectQueryBuilderExtended;
        }
    }

    /**
     * Finds accounts with a group by clause
     *
     * @param {FindManyOptionsExtended<Account>} options the options to use
     * @returns {Promise<Account[]>} the accounts found
     */
    async findWithGroupBy(options: FindManyOptionsExtended<Account>): Promise<Account[]> {
        let queryBuilder = this.createExtendedQueryBuilder(this.metadata.targetName).setFindOptionsExtended({
            ...options,
            relations: {
                bank: true
            }
        });
        return await queryBuilder.getMany();
    }
}

// Export the account repository
export const accountRepository = new AccountRepository(databaseProvider.database);
