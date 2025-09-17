/**
 * Represents a sync handler that can process and synchronize data.
 * @template T The type of data to be synchronized.
 */
export interface ISyncHandler<T> {
    /**
     * Synchronizes the given data.
     * @param data An array of data items to be synchronized.
     * @param deltaSync A boolean indicating whether to perform a delta sync.
     * @returns A void, any, or undefined value.
     */
    sync: (data: T[], deltaSync: boolean) => void | any | undefined;
}
