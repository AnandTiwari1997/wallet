import { Criteria } from './storage.js';

export interface Repository<T, I> {
    find(id: I): Promise<T | undefined>;

    add(item: T): Promise<T | undefined>;

    findAll(criteria: Criteria): Promise<T[]>;

    delete(id: I): Promise<boolean>;

    deleteAll(): Promise<boolean>;

    update(item: T): Promise<T | undefined>;
}
