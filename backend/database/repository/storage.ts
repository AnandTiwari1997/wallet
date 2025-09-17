/**
 * A generic interface for a data storage repository.
 * It defines the standard CRUD (Create, Read, Update, Delete) operations.
 * @template T The type of the items being stored.
 */
export interface Storage<T> {
    /**
     * Retrieves an item by its unique identifier.
     * @param id The unique identifier of the item.
     * @returns The item if found, otherwise undefined.
     */
    get(id: string): T | undefined;

    /**
     * Adds a new item to the storage.
     * @param item The item to add.
     * @returns The added item, or undefined if the operation fails.
     */
    add(item: T): T | undefined;

    /**
     * Retrieves a list of items based on specified criteria.
     * @param criteria The criteria for filtering, sorting, and pagination.
     * @returns An array of items that match the criteria.
     */
    getAll(criteria: Criteria): T[];

    /**
     * Deletes an item by its unique identifier.
     * @param id The unique identifier of the item to delete.
     * @returns True if the deletion was successful, otherwise false.
     */
    delete(id: string): boolean;

    /**
     * Deletes all items from the storage.
     * @returns True if the deletion was successful, otherwise false.
     */
    deleteAll(): boolean;

    /**
     * Updates an existing item in the storage.
     * @param item The item with updated values.
     * @returns The updated item, or undefined if the item was not found or the update failed.
     */
    update(item: T): T | undefined;
}

/**
 * Defines the criteria for querying data, including filtering, sorting,
 * grouping, and pagination.
 */
export interface Criteria {
    /**
     * Filters to apply to the query (e.g., `key = value`).
     */
    filters?: {
        key: string;
        value: string[];
    }[];
    /**
     * Sorting rules to apply to the result set.
     */
    sorts?: {
        key: string;
        ascending: boolean;
    }[];
    /**
     * Range filters to apply (e.g., `key BETWEEN start AND end`).
     */
    between?: {
        key: string;
        range: {
            start: string;
            end: string;
        };
    }[];
    /**
     * The number of records to skip for pagination. This is often treated as the page number.
     */
    offset?: number;
    /**
     * The maximum number of records to return.
     */
    limit?: number;
    /**
     * Fields to group the results by.
     */
    groupBy?: {
        key: string;
    }[];
}

/**
 * Constructs and appends a SQL WHERE clause to a base SQL query based on the provided criteria.
 * This function uses parameterized queries to prevent SQL injection.
 * @param sql The base SQL query string.
 * @param criteria The criteria object containing filters and ranges.
 * @param alias Optional table alias to prepend to column names (e.g., "u.").
 * @returns An object containing the modified SQL string and an array of values for the WHERE clause.
 */
export const addWhereClause = (sql: string, criteria: Criteria, alias: string = '') => {
    let whereClauseValues: any[] = [];
    let whereClause: string[] = [];
    let count = 1; // Start for parameter placeholders ($1, $2, ...)

    // Handle simple equality filters
    if (criteria.filters) {
        const filterClauses = criteria.filters.map((item) => {
            whereClauseValues.push(item.value);
            const aliasedKey = alias ? `${alias}.${item.key}` : item.key;
            return `${aliasedKey} = $${count++}`;
        });
        whereClause.push(...filterClauses);
    }

    // Handle 'BETWEEN' range filters
    if (criteria.between) {
        const betweenClauses = criteria.between.map((item) => {
            whereClauseValues.push(item.range.start);
            whereClauseValues.push(item.range.end);
            const clause = `${item.key} BETWEEN $${count++} AND $${count++}`;
            return clause;
        });
        whereClause.push(...betweenClauses);
    }

    if (whereClause.length > 0) {
        sql += ' WHERE ' + whereClause.join(' AND ');
    }

    return {
        sql: sql,
        whereClauses: whereClauseValues
    };
};

/**
 * Constructs and appends a SQL GROUP BY clause to a query.
 * @param sql The base SQL query string.
 * @param criteria The criteria object containing groupBy fields.
 * @returns The modified SQL string with the GROUP BY clause.
 */
export const addGroupByClause = (sql: string, criteria: Criteria) => {
    if (criteria.groupBy && criteria.groupBy.length > 0) {
        const groupByKeys = criteria.groupBy.map((groupBy) => groupBy.key);
        sql += ' GROUP BY ' + groupByKeys.join(', ');
    }
    return sql;
};

/**
 * Constructs and appends a SQL ORDER BY clause to a query.
 * @param sql The base SQL query string.
 * @param criteria The criteria object containing sorting rules.
 * @param alias Optional table alias to prepend to column names (e.g., "u.").
 * @returns The modified SQL string with the ORDER BY clause.
 */
export const addOrderByClause = (sql: string, criteria: Criteria, alias: string = '') => {
    if (criteria.sorts && criteria.sorts.length > 0) {
        const orderByClause = criteria.sorts
            .map((item) => {
                const aliasedKey = alias ? `${alias}.${item.key}` : item.key;
                return `${aliasedKey} ${item.ascending ? 'ASC' : 'DESC'}`;
            })
            .join(', ');

        if (orderByClause) {
            sql += ' ORDER BY ' + orderByClause;
        }
    }
    return sql;
};

/**
 * Appends LIMIT and OFFSET clauses to a SQL query for pagination.
 * @param sql The base SQL query string.
 * @param criteria The criteria object containing limit and offset values.
 * @returns The modified SQL string with LIMIT and OFFSET clauses.
 */
export const addLimitAndOffset = (sql: string, criteria: Criteria) => {
    if (criteria.limit) {
        sql += ' LIMIT ' + criteria.limit;
    }
    if (criteria.offset) {
        // The offset is calculated based on the page number (offset) and page size (limit).
        // If limit is not provided, a default of 25 is assumed for the calculation.
        const pageSize = criteria.limit ? criteria.limit : 25;
        const calculatedOffset = criteria.offset > 0 ? criteria.offset * pageSize : 0;
        sql += ' OFFSET ' + calculatedOffset;
    }
    return sql;
};
