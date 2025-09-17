/**
 * Represents the criteria for an API request, including filtering, sorting, pagination, and grouping.
 */
export interface ApiCriteria {
    /**
     * An array of filters to apply to the request.
     * Each filter specifies a key and an array of values to match.
     */
    filters?: { key: string; value: string[] }[];
    /**
     * An array of sorting criteria to apply to the request.
     * Each sort criterion specifies a key and whether the sort order is ascending.
     */
    sorts?: { key: string; ascending: boolean }[];
    /**
     * An array of range filters to apply to the request.
     * Each range filter specifies a key and a start and end value for the range.
     */
    between?: { key: string; range: { start: string; end: string } }[];
    /**
     * The offset from which to start returning results, used for pagination.
     */
    offset?: number;
    /**
     * The maximum number of results to return, used for pagination.
     */
    limit?: number;
    /**
     * An array of grouping criteria to apply to the request.
     * Each group criterion specifies a key to group by.
     */
    groupBy?: { key: string }[];
}
