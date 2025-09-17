/**
 * @file Defines the repository for Holding entities.
 * @author anandt1@
 */

import { Logger } from '../../core/logger.js';
import { DataSource, Repository } from 'typeorm';
import { Holding } from '../models/holding.js';
import { databaseProvider } from '../database-provider.js';
import { FindManyOptionsExtended } from '../find-options/FindManyOptionsExtended.js';
import { SelectQueryBuilderExtended } from '../query-builder/SelectQueryBuilderExtended.js';
import { DriverUtils } from 'typeorm/driver/DriverUtils.js';

// Logger for the HoldingRepository.
const logger: Logger = new Logger('HoldingRepository');

/**
 * Repository for handling database operations for Holding entities.
 * @extends Repository<Holding>
 */
class HoldingRepository extends Repository<Holding> {
    private readonly dataSource: DataSource;

    /**
     * Creates an instance of HoldingRepository.
     * @param {DataSource} dataSource - The TypeORM data source.
     */
    constructor(dataSource: DataSource) {
        super(Holding, dataSource.manager, dataSource.createQueryRunner());
        this.dataSource = dataSource;
    }

    /**
     * Creates an extended query builder for more complex queries.
     * @param {string} [alias] - The alias for the table.
     * @returns {SelectQueryBuilderExtended<Holding>} - The extended query builder.
     */
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

    /**
     * Finds entities with grouping based on the provided options.
     * @param {FindManyOptionsExtended<Holding>} options - The find options.
     * @returns {Promise<Holding[]>} - The found entities.
     */
    async findWithGroupBy(options: FindManyOptionsExtended<Holding>): Promise<Holding[]> {
        let queryBuilder = this.createExtendedQueryBuilder(this.metadata.targetName).setFindOptionsExtended(options);
        return await queryBuilder.getMany();
    }
}

/**
 * The singleton instance of the HoldingRepository.
 */
export const holdingRepository = new HoldingRepository(databaseProvider.database);
