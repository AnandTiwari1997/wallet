export interface Storage<T> {
    get(id: string): T | undefined;

    add(item: T): T | undefined;

    getAll(criteria: Criteria): T[];

    delete(id: string): boolean;

    deleteAll(): boolean;

    update(item: T): T | undefined;
}

export interface Criteria {
    filters?: { key: string; value: string }[];
    sorts?: { key: string; ascending: boolean }[];
    between?: { key: string; range: { start: string; end: string } }[];
    offset?: number;
    limit?: number;
    groupBy?: { key: string }[];
}

export const addWhereClause = (sql: string, criteria: Criteria) => {
    let whereClauseValues: any[] = [];
    let whereClause = [];
    if (criteria.filters) {
        whereClause.push(
            criteria.filters.map((item) => {
                whereClauseValues.push(item.value);
                return `${item.key} = ?`;
            })
        );
    }
    if (criteria.between) {
        whereClause.push(
            criteria.between.map((item) => {
                whereClauseValues.push(item.range.start);
                whereClauseValues.push(item.range.end);
                return `${item.key} BETWEEN ? AND ?`;
            })
        );
    }
    whereClause = whereClause.flatMap((value) => value);
    if (whereClause && whereClause.length > 0) {
        sql = sql + ' WHERE ' + whereClause.join(' AND ');
    }
    return {
        sql: sql,
        whereClauses: whereClauseValues
    };
};

export const addGroupByClause = (sql: string, criteria: Criteria) => {
    let groupByClause = [];
    if (criteria.groupBy) {
        groupByClause.push(criteria.groupBy.map((groupBy) => groupBy.key));
    }
    groupByClause = groupByClause.flatMap((value) => value);
    if (groupByClause.length > 0) {
        sql = sql + ' GROUP BY ' + groupByClause.join(', ');
    }
    return sql;
};

export const addOrderByClause = (sql: string, criteria: Criteria) => {
    if (criteria.sorts) {
        let orderByClause = criteria.sorts
            .map((item) => {
                return `${item.key} ${item.ascending ? 'ASC' : 'DESC'}`;
            })
            .join(', ');
        if (orderByClause && orderByClause.length > 0) {
            sql = sql + ' ORDER BY ' + orderByClause;
        }
    }
    return sql;
};

export const addLimitAndOffset = (sql: string, criteria: Criteria) => {
    if (criteria.limit) {
        sql = sql + ' LIMIT ' + criteria.limit;
    }
    if (criteria.offset) {
        sql = sql + ' OFFSET ' + (criteria.offset > 0 ? criteria.offset * (criteria.limit ? criteria.limit : 25) : 0);
    }
    return sql;
};
