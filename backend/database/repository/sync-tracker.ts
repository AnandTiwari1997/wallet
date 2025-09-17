/**
 * Represents a tracker for a synchronization process.
 */
export interface SyncTracker {
    /**
     * The type of synchronization being tracked.
     */
    syncType: string;
    /**
     * The current status of the synchronization.
     */
    status: string;
    /**
     * The time when the synchronization process started.
     */
    startTime: Date;
    /**
     * The time when the synchronization process ended. This is optional.
     */
    endTime?: Date;
}
