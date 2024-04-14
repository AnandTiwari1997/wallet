import { Bank } from '../models/bank.js';
import { databaseProvider } from '../database-provider.js';
import { DataSource, Repository } from 'typeorm';
import { FindManyOptionsExtended } from '../find-options/FindManyOptionsExtended.js';
import { SelectQueryBuilderExtended } from '../query-builder/SelectQueryBuilderExtended.js';
import { DriverUtils } from 'typeorm/driver/DriverUtils.js';

class BankRepository extends Repository<Bank> {
    private readonly dataSource: DataSource;

    constructor(dataSource: DataSource) {
        super(Bank, dataSource.manager, dataSource.createQueryRunner());
        this.dataSource = dataSource;
    }

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

    async findWithGroupBy(options: FindManyOptionsExtended<Bank>): Promise<Bank[]> {
        let queryBuilder = this.createExtendedQueryBuilder(this.metadata.targetName).setFindOptionsExtended(options);
        return await queryBuilder.getMany();
    }
}

export const bankRepository = new BankRepository(databaseProvider.database);
