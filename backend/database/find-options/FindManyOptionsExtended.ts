import { FindManyOptions, ObjectId } from 'typeorm';

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

export type FindOptionsGroupBy<Entity> = {
    [P in keyof Entity]?: P extends 'toString' ? unknown : FindOptionsGroupByProperty<NonNullable<Entity[P]>>;
};

export interface FindManyOptionsExtended<Entity = any> extends FindManyOptions<Entity> {
    groupBy?: FindOptionsGroupBy<Entity>;
    limit?: number;
    offset?: number;
}
