import { Storage } from './storage.js';
import { InMemoryData } from '../models/in-memory-data.js';

class InMemoryStorage implements Storage<InMemoryData> {
    data: { [key: string]: any } = {};

    add(item: InMemoryData): InMemoryData {
        if (!this.data[item.key]) {
            this.data[item.key] = item;
        }
        return this.data[item.key];
    }

    addAll(items: InMemoryData[]): InMemoryData[] {
        return [];
    }

    delete(id: string): boolean {
        delete this.data[id];
        return !this.data[id];
    }

    deleteAll(): boolean {
        return false;
    }

    get(id: string): InMemoryData | undefined {
        return this.data[id] ? this.data[id] : undefined;
    }

    getAll(): InMemoryData[] {
        return Object.values(this.data);
    }

    update(item: InMemoryData): InMemoryData | undefined {
        return undefined;
    }
}

export const inMemoryStorage = new InMemoryStorage();
