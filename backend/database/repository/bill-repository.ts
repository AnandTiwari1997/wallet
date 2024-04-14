import { Bill } from '../models/bill.js';
import { Logger } from '../../core/logger.js';
import { DataSource, Repository } from 'typeorm';
import { databaseProvider } from '../database-provider.js';
import { FindManyOptionsExtended } from '../find-options/FindManyOptionsExtended.js';
import { SelectQueryBuilderExtended } from '../query-builder/SelectQueryBuilderExtended.js';
import { DriverUtils } from 'typeorm/driver/DriverUtils.js';

const logger: Logger = new Logger('BillRepository');

class BillRepository extends Repository<Bill> {
    private readonly dataSource: DataSource;

    constructor(dataSource: DataSource) {
        super(Bill, dataSource.manager, dataSource.createQueryRunner());
        this.dataSource = dataSource;
    }

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

    async findWithGroupBy(options: FindManyOptionsExtended<Bill>): Promise<Bill[]> {
        let queryBuilder = this.createExtendedQueryBuilder(this.metadata.targetName).setFindOptionsExtended(options);
        return queryBuilder.getMany();
    }
}

export const billRepository = new BillRepository(databaseProvider.database);
