import { Logger } from '../../core/logger.js';
import { DataSource, Repository } from 'typeorm';
import { Holding } from '../models/holding.js';
import { databaseProvider } from '../database-provider.js';
import { FindManyOptionsExtended } from '../find-options/FindManyOptionsExtended.js';
import { SelectQueryBuilderExtended } from '../query-builder/SelectQueryBuilderExtended.js';
import { DriverUtils } from 'typeorm/driver/DriverUtils.js';

const logger: Logger = new Logger('HoldingRepository');

class HoldingRepository extends Repository<Holding> {
    private readonly dataSource: DataSource;

    constructor(dataSource: DataSource) {
        super(Holding, dataSource.manager, dataSource.createQueryRunner());
        this.dataSource = dataSource;
    }

    createExtendedQueryBuilder(alias?: string): SelectQueryBuilderExtended<Holding> {
        let selectQueryBuilderExtended = new SelectQueryBuilderExtended<Holding>(this.dataSource, this.queryRunner);
        if (alias) {
            let alias_ = DriverUtils.buildAlias(this.dataSource.driver, undefined, alias);
            selectQueryBuilderExtended.select(alias_).from(this.metadata.target, alias_);
            return selectQueryBuilderExtended;
        } else {
            return selectQueryBuilderExtended;
        }
    }

    async findWithGroupBy(options: FindManyOptionsExtended<Holding>): Promise<Holding[]> {
        let queryBuilder = this.createExtendedQueryBuilder(this.metadata.targetName).setFindOptionsExtended(options);
        return await queryBuilder.getMany();
    }
}

export const holdingRepository = new HoldingRepository(databaseProvider.database);
