import { AccountTransaction } from '../models/account-transaction.js';
import { Logger } from '../../core/logger.js';
import { DataSource, Repository } from 'typeorm';
import { databaseProvider } from '../database-provider.js';
import { SelectQueryBuilderExtended } from '../query-builder/SelectQueryBuilderExtended.js';
import { FindManyOptionsExtended } from '../find-options/FindManyOptionsExtended.js';
import { DriverUtils } from 'typeorm/driver/DriverUtils.js';

const logger: Logger = new Logger('AccountTransactionRepository');

class AccountTransactionRepository extends Repository<AccountTransaction> {
    private readonly dataSource: DataSource;

    constructor(dataSource: DataSource) {
        super(AccountTransaction, dataSource.manager, dataSource.createQueryRunner());
        this.dataSource = dataSource;
    }

    createExtendedQueryBuilder(alias?: string): SelectQueryBuilderExtended<AccountTransaction> {
        let selectQueryBuilderExtended = new SelectQueryBuilderExtended<AccountTransaction>(this.dataSource, this.queryRunner);
        if (alias) {
            let alias_ = DriverUtils.buildAlias(this.dataSource.driver, undefined, alias);
            selectQueryBuilderExtended.select(alias_).from(this.metadata.target, alias_);
            return selectQueryBuilderExtended;
        } else {
            return selectQueryBuilderExtended;
        }
    }

    async countWithGroupBy(options: FindManyOptionsExtended<AccountTransaction>): Promise<number> {
        let innerQuery = this.createExtendedQueryBuilder(this.metadata.targetName);
        innerQuery.select('dated');
        innerQuery.setFindOptionsExtended({
            ...options,
            relations: {
                account: false
            }
        });
        return (await innerQuery.getRawMany()).length;
    }

    async findWithGroupBy(options: FindManyOptionsExtended<AccountTransaction>): Promise<AccountTransaction[]> {
        try {
            let innerQuery = this.createExtendedQueryBuilder();
            innerQuery.select('dated');
            innerQuery.from(AccountTransaction, 'account_transaction');
            innerQuery.setFindOptionsExtended({
                ...options,
                relations: {
                    account: false
                }
            });
            let finalQuery = this.createExtendedQueryBuilder(this.metadata.targetName);
            finalQuery.setFindOptionsExtended({
                where: options.where,
                order: options.order,
                relations: {
                    account: true
                }
            });
            finalQuery.andWhere(`dated IN (${innerQuery.getQuery()})`);
            let parameters = innerQuery.getParameters();
            for (let key in parameters) {
                finalQuery.setParameter(key, parameters[key]);
            }
            return await finalQuery.getMany();
        } catch (error) {
            logger.error(`[FindAllUsingGroupBy] - Error On FindAllUsingGroupBy ${error}`);
            return [];
        }
    }
}

export const accountTransactionRepository = new AccountTransactionRepository(databaseProvider.database);
