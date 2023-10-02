import { Criteria, Storage } from './storage.js';
import { ProvidentFundTransaction } from '../models/provident-fund-transaction.js';
import { MutualFundTransaction } from '../models/mutual-fund-transaction.js';
import { ArrayUtil } from '../constant.js';

class ProvidentFundStorage implements Storage<ProvidentFundTransaction> {
    data: { [key: string]: ProvidentFundTransaction } = {};

    get(id: string): ProvidentFundTransaction {
        return this.data[id];
    }
    add(item: ProvidentFundTransaction): ProvidentFundTransaction {
        const id = this.generateId(item);
        if (this.data[id]) return this.data[id];
        else {
            item.transactionId = id;
            this.data[id] = item;
            return item;
        }
    }
    getAll(criteria: Criteria): ProvidentFundTransaction[] {
        let result = Object.values(this.data);
        if (criteria.filters) {
            criteria.filters.forEach((filter) => {
                const key = filter.key as keyof ProvidentFundTransaction;
                result = ArrayUtil.filter(result, (item) => item[key] === filter.value);
            });
        }
        if (criteria.sorts) {
            criteria.sorts.forEach((sort) => {
                const key = sort.key as keyof ProvidentFundTransaction;
                result = ArrayUtil.sort(result, (item) => item[key], sort.ascending);
            });
        }
        return result;
    }
    delete(id: string): boolean {
        delete this.data[id];
        return !this.data[id];
    }
    deleteAll(): boolean {
        this.data = {};
        return Object.keys(this.data).length == 0;
    }
    addAll(items: ProvidentFundTransaction[]): ProvidentFundTransaction[] {
        const returnedData: ProvidentFundTransaction[] = [];
        for (let item of items) {
            returnedData.push(this.add(item));
        }
        return returnedData;
    }
    update(item: ProvidentFundTransaction): ProvidentFundTransaction | undefined {
        if (this.data[item.transactionId]) {
            this.data[item.transactionId] = item;
            return this.data[item.transactionId];
        }
    }

    generateId = (item: ProvidentFundTransaction): string => {
        let id = '';
        for (let key of item) {
            id = id + String(key);
        }
        return id;
    };
}

export const providentFundStorage = new ProvidentFundStorage();
