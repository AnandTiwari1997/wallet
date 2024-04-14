import { Logger } from '../../core/logger.js';
import { DataSource, Repository } from 'typeorm';
import { Broker } from '../models/broker.js';
import { databaseProvider } from '../database-provider.js';
import { FindManyOptionsExtended } from '../find-options/FindManyOptionsExtended.js';
import { SelectQueryBuilderExtended } from '../query-builder/SelectQueryBuilderExtended.js';
import { DriverUtils } from 'typeorm/driver/DriverUtils.js';

const logger: Logger = new Logger('BrokerRepository');

class BrokerRepository extends Repository<Broker> {
    private readonly dataSource: DataSource;

    constructor(dataSource: DataSource) {
        super(Broker, dataSource.manager, dataSource.createQueryRunner());
        this.dataSource = dataSource;
    }

    createExtendedQueryBuilder(alias?: string): SelectQueryBuilderExtended<Broker> {
        let selectQueryBuilderExtended = new SelectQueryBuilderExtended<Broker>(this.dataSource, this.queryRunner);
        if (alias) {
            let alias_ = DriverUtils.buildAlias(this.dataSource.driver, undefined, alias);
            selectQueryBuilderExtended.select(alias_).from(this.metadata.target, alias_);
            return selectQueryBuilderExtended;
        } else {
            return selectQueryBuilderExtended;
        }
    }

    async findWithGroupBy(options: FindManyOptionsExtended<Broker>): Promise<Broker[]> {
        let queryBuilder = this.createExtendedQueryBuilder(this.metadata.targetName).setFindOptionsExtended(options);
        return await queryBuilder.getMany();
    }
}

export const brokerRepository = new BrokerRepository(databaseProvider.database);
