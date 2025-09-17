/**
 * Represents the standard body of an API response.
 * @template T The type of the results in the response.
 */
export interface ApiResponseBody<T> {
    /**
     * An array of results.
     */
    results: T[];
    /**
     * The total number of results found.
     */
    num_found: number;
}

/**
 * Represents the body of a response that contains a message.
 * @template T The type of the message.
 */
export interface MessageResponseBody<T> {
    /**
     * The message content.
     */
    message: T;
}
