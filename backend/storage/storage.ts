export interface Storage<T> {
    get(id: string): T | undefined;
    add(item: T): T;
    getAll(criteria: Criteria): T[];
    delete(id: string): boolean;
    deleteAll(): boolean;
    addAll(items: T[]): T[];
    update(item: T): T | undefined;
}

export interface Criteria {
    filters?: { key: string; value: string }[];
    sorts?: { key: string; ascending: boolean }[];
}
