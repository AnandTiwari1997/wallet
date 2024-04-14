export interface ApiCriteria {
    filters?: { key: string; value: string[] }[];
    sorts?: { key: string; ascending: boolean }[];
    between?: { key: string; range: { start: string; end: string } }[];
    offset?: number;
    limit?: number;
    groupBy?: { key: string }[];
}
