import { Storage } from './storage.js';

class CaptchaStorage implements Storage<{ id: string; text?: string }> {
    data: { [key: string]: { id: string; text?: string } } = {};

    add(item: { id: string; text?: string }): { id: string; text?: string } {
        if (!this.data[item.id]) {
            this.data[item.id] = item;
        }
        return this.data[item.id];
    }

    addAll(items: { id: string; text?: string }[]): { id: string; text?: string }[] {
        return [];
    }

    delete(id: string): boolean {
        delete this.data[id];
        return !this.data[id];
    }

    deleteAll(): boolean {
        return false;
    }

    get(id: string): { id: string; text?: string } | undefined {
        return this.data[id] ? this.data[id] : undefined;
    }

    getAll(): { id: string; text?: string }[] {
        return Object.values(this.data);
    }

    update(item: { id: string; text?: string }): { id: string; text?: string } | undefined {
        return undefined;
    }
}

export const captchaStorage = new CaptchaStorage();
