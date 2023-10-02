import { Storage } from './storage.js';
import { SyncTracker } from './sync-tracker.js';

export class SyncTrackerStorage implements Storage<SyncTracker> {
    data: { [key: string]: SyncTracker[] } = {};

    add(item: SyncTracker): SyncTracker {
        const dataItems = this.data[item.syncType] || [];
        dataItems.push(item);
        this.data[item.syncType] = dataItems;
        return item;
    }

    addAll(items: SyncTracker[]): SyncTracker[] {
        return [];
    }

    delete(id: string): boolean {
        return false;
    }

    deleteAll(): boolean {
        return false;
    }

    get(id: string): SyncTracker | undefined {
        if (!this.data[id]) return undefined;
        const dataItems = this.data[id];
        return dataItems.find((currentItem) => {
            return currentItem.status === 'IN_PROGRESS';
        });
    }

    getAllById(id: string): SyncTracker[] {
        return this.data[id];
    }

    getAll(): SyncTracker[] {
        return Object.values(this.data).flat();
    }

    isSyncInProgress(syncType: string): boolean {
        if (!this.data[syncType]) return false;
        const dataItems = this.data[syncType];
        return (
            dataItems.find((currentItem) => {
                return currentItem.status === 'IN_PROGRESS';
            }) !== undefined
        );
    }

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

export const syncTrackerStorage = new SyncTrackerStorage();
