/**
 * @file Defines the repository for Broker entities.
 * @author anandt1@
 */

import { Logger } from '../../core/logger.js';
import { DataSource, Repository } from 'typeorm';
import { Broker } from '../models/broker.js';
import { databaseProvider } from '../database-provider.js';
import { FindManyOptionsExtended } from '../find-options/FindManyOptionsExtended.js';
import { SelectQueryBuilderExtended } from '../query-builder/SelectQueryBuilderExtended.js';
import { DriverUtils } from 'typeorm/driver/DriverUtils.js';

// Logger for the BrokerRepository.
const logger: Logger = new Logger('BrokerRepository');

/**
 * Repository for handling database operations for Broker entities.
 * @extends Repository<Broker>
 */
class BrokerRepository extends Repository<Broker> {
    private readonly dataSource: DataSource;

    /**
     * Creates an instance of BrokerRepository.
     * @param {DataSource} dataSource - The TypeORM data source.
     */
    constructor(dataSource: DataSource) {
        super(Broker, dataSource.manager, dataSource.createQueryRunner());
        this.dataSource = dataSource;
    }

    /**
     * Creates an extended query builder for more complex queries.
     * @param {string} [alias] - The alias for the table.
     * @returns {SelectQueryBuilderExtended<Broker>} - The extended query builder.
     */
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

    /**
     * Finds entities with grouping based on the provided options.
     * @param {FindManyOptionsExtended<Broker>} options - The find options.
     * @returns {Promise<Broker[]>} - The found entities.
     */
    async findWithGroupBy(options: FindManyOptionsExtended<Broker>): Promise<Broker[]> {
        let queryBuilder = this.createExtendedQueryBuilder(this.metadata.targetName).setFindOptionsExtended(options);
        return await queryBuilder.getMany();
    }
}

/**
 * The singleton instance of the BrokerRepository.
 */
export const brokerRepository = new BrokerRepository(databaseProvider.database);
