import { DataSource, ObjectLiteral, QueryRunner, SelectQueryBuilder } from 'typeorm';
import { FindManyOptionsExtended } from '../find-options/FindManyOptionsExtended.js';

/**
 * Extends the TypeORM SelectQueryBuilder to add support for extended find options.
 *
 * @export
 * @class SelectQueryBuilderExtended
 * @extends {SelectQueryBuilder<Entity>}
 * @template Entity
 */
export class SelectQueryBuilderExtended<Entity extends ObjectLiteral> extends SelectQueryBuilder<Entity> {
    /**
     * Creates an instance of SelectQueryBuilderExtended.
     * @param {DataSource} connection
     * @param {QueryRunner} [queryRunner]
     * @memberof SelectQueryBuilderExtended
     */
    constructor(connection: DataSource, queryRunner?: QueryRunner) {
        super(connection, queryRunner);
    }

    /**
     * Sets the extended find options for the query.
     *
     * @param {FindManyOptionsExtended<Entity>} findOptions
     * @returns {SelectQueryBuilderExtended<Entity>}
     * @memberof SelectQueryBuilderExtended
     */
    setFindOptionsExtended(findOptions: FindManyOptionsExtended<Entity>): SelectQueryBuilderExtended<Entity> {
        if (findOptions.groupBy) {
            for (const key in findOptions.groupBy) {
                // @ts-ignore
                if (findOptions.groupBy.hasOwnProperty(key) && findOptions.groupBy[key]) {
                    this.addGroupBy(key);
                }
            }
        }
        this.setFindOptions(findOptions);
        if (findOptions.limit) {
            this.limit(findOptions.limit);
        }
        if (findOptions.offset) {
            this.offset(findOptions.offset);
        }
        return this;
    }
}
