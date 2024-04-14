import { Logger } from '../../core/logger.js';
import { DataSource, Repository } from 'typeorm';
import { DematAccount } from '../models/demat-account.js';
import { databaseProvider } from '../database-provider.js';
import { FindManyOptionsExtended } from '../find-options/FindManyOptionsExtended.js';
import { SelectQueryBuilderExtended } from '../query-builder/SelectQueryBuilderExtended.js';
import { DriverUtils } from 'typeorm/driver/DriverUtils.js';

const logger: Logger = new Logger('DematAccountRepository');

class DematAccountRepository extends Repository<DematAccount> {
    private readonly dataSource: DataSource;

    constructor(dataSource: DataSource) {
        super(DematAccount, dataSource.manager, dataSource.createQueryRunner());
        this.dataSource = dataSource;
    }

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

    async findWithGroupBy(options: FindManyOptionsExtended<DematAccount>): Promise<DematAccount[]> {
        let queryBuilder = this.createExtendedQueryBuilder(this.metadata.targetName).setFindOptionsExtended(options);
        return await queryBuilder.getMany();
    }
}

export const dematAccountRepository = new DematAccountRepository(databaseProvider.database);
