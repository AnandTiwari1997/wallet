/**
 * @file Defines the repository for Consent entities.
 * @author anandt1@
 */

import { Logger } from '../../core/logger.js';
import { DataSource, Repository } from 'typeorm';
import { databaseProvider } from '../database-provider.js';
import { FindManyOptionsExtended } from '../find-options/FindManyOptionsExtended.js';
import { SelectQueryBuilderExtended } from '../query-builder/SelectQueryBuilderExtended.js';
import { DriverUtils } from 'typeorm/driver/DriverUtils.js';
import { Consent } from '../models/consent.js';

// Logger for the ConsentRepository.
const logger: Logger = new Logger('ConsentRepository');

/**
 * Repository for handling database operations for Consent entities.
 * @extends Repository<Consent>
 */
class ConsentRepository extends Repository<Consent> {
    private readonly dataSource: DataSource;

    /**
     * Creates an instance of ConsentRepository.
     * @param {DataSource} dataSource - The TypeORM data source.
     */
    constructor(dataSource: DataSource) {
        super(Consent, dataSource.manager, dataSource.createQueryRunner());
        this.dataSource = dataSource;
    }

    /**
     * Creates an extended query builder for more complex queries.
     * @param {string} [alias] - The alias for the table.
     * @returns {SelectQueryBuilderExtended<Consent>} - The extended query builder.
     */
    createExtendedQueryBuilder(alias?: string): SelectQueryBuilderExtended<Consent> {
        let selectQueryBuilderExtended = new SelectQueryBuilderExtended<Consent>(this.dataSource, this.queryRunner);
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
     * @param {FindManyOptionsExtended<Bill>} options - The find options.
     * @returns {Promise<Bill[]>} - The found entities.
     */
    async findWithGroupBy(options: FindManyOptionsExtended<Consent>): Promise<Consent[]> {
        let queryBuilder = this.createExtendedQueryBuilder(this.metadata.targetName).setFindOptionsExtended(options);
        return queryBuilder.getMany();
    }
}

/**
 * The singleton instance of the ConsentRepository.
 */
export const consentRepository = new ConsentRepository(databaseProvider.database);
