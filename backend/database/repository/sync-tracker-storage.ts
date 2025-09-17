/**
 * @file This file contains the implementation of the SyncTrackerStorage class, which is used for managing sync tracker data.
 */
import { Storage } from './storage.js';
import { SyncTracker } from './sync-tracker.js';

/**
 * A storage class for managing SyncTracker objects.
 * It implements the Storage interface for SyncTracker.
 */
export class SyncTrackerStorage implements Storage<SyncTracker> {
    /**
     * The in-memory data store for sync trackers, organized by sync type.
     */
    data: { [key: string]: SyncTracker[] } = {};

    /**
     * Adds a new SyncTracker item to the storage.
     * @param item The SyncTracker item to add.
     * @returns The added SyncTracker item.
     */
    add(item: SyncTracker): SyncTracker {
        const dataItems = this.data[item.syncType] || [];
        dataItems.push(item);
        this.data[item.syncType] = dataItems;
        return item;
    }

    /**
     * This method is not implemented and returns an empty array.
     * @param items The SyncTracker items to add.
     * @returns An empty array.
     */
    addAll(items: SyncTracker[]): SyncTracker[] {
        return [];
    }

    /**
     * This method is not implemented and returns false.
     * @param id The ID of the item to delete.
     * @returns false.
     */
    delete(id: string): boolean {
        return false;
    }

    /**
     * This method is not implemented and returns false.
     * @returns false.
     */
    deleteAll(): boolean {
        return false;
    }

    /**
     * Retrieves a SyncTracker item with the status 'IN_PROGRESS' for a given sync type.
     * @param id The sync type to look for.
     * @returns The SyncTracker item if found, otherwise undefined.
     */
    get(id: string): SyncTracker | undefined {
        if (!this.data[id]) return undefined;
        const dataItems = this.data[id];
        return dataItems.find((currentItem) => {
            return currentItem.status === 'IN_PROGRESS';
        });
    }

    /**
     * Retrieves all SyncTracker items for a given sync type.
     * @param id The sync type.
     * @returns An array of SyncTracker items.
     */
    getAllById(id: string): SyncTracker[] {
        return this.data[id];
    }

    /**
     * Retrieves all SyncTracker items from the storage.
     * @returns An array of all SyncTracker items.
     */
    getAll(): SyncTracker[] {
        return Object.values(this.data).flat();
    }

    /**
     * Checks if a sync is currently in progress for a given sync type.
     * @param syncType The sync type to check.
     * @returns True if a sync is in progress, otherwise false.
     */
    isSyncInProgress(syncType: string): boolean {
        if (!this.data[syncType]) return false;
        const dataItems = this.data[syncType];
        return (
            dataItems.find((currentItem) => {
                return currentItem.status === 'IN_PROGRESS';
            }) !== undefined
        );
    }

    /**
     * Updates an existing SyncTracker item.
     * The item to be updated is identified by its syncType and startTime.
     * @param item The SyncTracker item with updated values.
     * @returns The updated SyncTracker item if found, otherwise undefined.
     */
    update(item: SyncTracker): SyncTracker | undefined {
        const foundItem = this.data[item.syncType].find((currentValue) => {
            return currentValue.startTime === item.startTime;
        });
        if (!foundItem) return undefined;
        foundItem.startTime = item.startTime;
        foundItem.status = item.status;
        foundItem.endTime = item.endTime;
        return foundItem;
    }
}

/**
 * A singleton instance of the SyncTrackerStorage.
 */
export const syncTrackerStorage = new SyncTrackerStorage();
