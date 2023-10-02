import { Storage } from './storage.js';

class CaptchaStorage implements Storage<{ captchaId: string; captchaText?: string }> {
    data: { [key: string]: { captchaId: string; captchaText?: string } } = {};

    add(item: { captchaId: string; captchaText?: string }): { captchaId: string; captchaText?: string } {
        if (!this.data[item.captchaId]) {
            this.data[item.captchaId] = item;
        }
        return this.data[item.captchaId];
    }

    addAll(items: { captchaId: string; captchaText?: string }[]): { captchaId: string; captchaText?: string }[] {
        return [];
    }

    delete(id: string): boolean {
        delete this.data[id];
        return !this.data[id];
    }

    deleteAll(): boolean {
        return false;
    }

    get(id: string): { captchaId: string; captchaText?: string } | undefined {
        return this.data[id] ? this.data[id] : undefined;
    }

    getAll(): { captchaId: string; captchaText?: string }[] {
        return Object.values(this.data);
    }

    update(item: { captchaId: string; captchaText?: string }): { captchaId: string; captchaText?: string } | undefined {
        return undefined;
    }
}

export const captchaStorage = new CaptchaStorage();
