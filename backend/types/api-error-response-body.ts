/**
 * Represents the body of an API error response.
 */
export interface ApiErrorResponseBody {
    /**
     * A machine-readable error code.
     */
    errorCode: string;
    /**
     * A human-readable error message.
     */
    errorMessage: string;
}
