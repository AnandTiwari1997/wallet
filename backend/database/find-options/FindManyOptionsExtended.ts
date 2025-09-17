import { FindManyOptions, ObjectId } from 'typeorm';

/**
 * Defines the group by options for a specific property.
 * It recursively traverses the properties of an object and allows specifying boolean flags for grouping.
 */
export type FindOptionsGroupByProperty<Property> = Property extends Promise<infer I>
    ? FindOptionsGroupByProperty<I> | boolean
    : Property extends Array<infer I>
    ? FindOptionsGroupByProperty<I> | boolean
    : Property extends string
    ? boolean
    : Property extends number
    ? boolean
    : Property extends boolean
    ? boolean
    : Property extends Function
    ? never
    : Property extends Buffer
    ? boolean
    : Property extends Date
    ? boolean
    : Property extends ObjectId
    ? boolean
    : Property extends object
    ? FindOptionsGroupBy<Property>
    : boolean;

/**
 * Defines the group by options for an entity.
 * It maps over the properties of an entity and applies FindOptionsGroupByProperty to each property.
 */
export type FindOptionsGroupBy<Entity> = {
    [P in keyof Entity]?: P extends 'toString' ? unknown : FindOptionsGroupByProperty<NonNullable<Entity[P]>>;
};

/**
 * Extends the FindManyOptions from TypeORM with additional options for pagination and grouping.
 */
export interface FindManyOptionsExtended<Entity = any> extends FindManyOptions<Entity> {
    /**
     * Group by options.
     */
    groupBy?: FindOptionsGroupBy<Entity>;
    /**
     * Limit number of records.
     */
    limit?: number;
    /**
     * Offset of records.
     */
    offset?: number;
}
