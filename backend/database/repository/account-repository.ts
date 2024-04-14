import { Account } from '../models/account.js';
import { databaseProvider } from '../database-provider.js';
import { DataSource, Repository } from 'typeorm';
import { Logger } from '../../core/logger.js';
import { FindManyOptionsExtended } from '../find-options/FindManyOptionsExtended.js';
import { SelectQueryBuilderExtended } from '../query-builder/SelectQueryBuilderExtended.js';
import { DriverUtils } from 'typeorm/driver/DriverUtils.js';

const logger: Logger = new Logger('AccountRepository');

class AccountRepository extends Repository<Account> {
    private readonly dataSource: DataSource;

    constructor(dataSource: DataSource) {
        super(Account, dataSource.manager, dataSource.createQueryRunner());
        this.dataSource = dataSource;
    }

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

export const accountRepository = new AccountRepository(databaseProvider.database);
