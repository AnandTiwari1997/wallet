import { DataSource, ObjectLiteral, QueryRunner, SelectQueryBuilder } from 'typeorm';
import { FindManyOptionsExtended } from '../find-options/FindManyOptionsExtended.js';

export class SelectQueryBuilderExtended<Entity extends ObjectLiteral> extends SelectQueryBuilder<Entity> {
    constructor(connection: DataSource, queryRunner?: QueryRunner) {
        super(connection, queryRunner);
    }

    setFindOptionsExtended(findOptions: FindManyOptionsExtended<Entity>): SelectQueryBuilderExtended<Entity> {
        if (findOptions.groupBy) {
            for (let key in findOptions.groupBy) {
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
