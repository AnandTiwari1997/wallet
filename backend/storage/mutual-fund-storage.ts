import { Criteria, Storage } from './storage.js';
import { MutualFundTransaction } from '../models/mutual-fund-transaction.js';
import { ArrayUtil } from '../constant.js';
import { ProvidentFundTransaction } from '../models/provident-fund-transaction.js';

class MutualFundStorage implements Storage<MutualFundTransaction> {
    data: { [key: string]: MutualFundTransaction } = {};

    get(id: string): MutualFundTransaction {
        return this.data[id];
    }
    add(item: MutualFundTransaction): MutualFundTransaction {
        const id = this.generateId(item);
        if (this.data[id]) return this.data[id];
        else {
            item.transactionId = id;
            this.data[id] = item;
            return item;
        }
    }
    getAll(criteria: Criteria): MutualFundTransaction[] {
        let result = Object.values(this.data);
        if (criteria.filters) {
            criteria.filters.forEach((filter) => {
                const key = filter.key as keyof MutualFundTransaction;
                result = ArrayUtil.filter(result, (item) => item[key] === filter.value);
            });
        }
        if (criteria.sorts) {
            criteria.sorts.forEach((sort) => {
                const key = sort.key as keyof MutualFundTransaction;
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
    addAll(items: MutualFundTransaction[]): MutualFundTransaction[] {
        const returnedData: MutualFundTransaction[] = [];
        for (let item of items) {
            returnedData.push(this.add(item));
        }
        return returnedData;
    }
    update(item: MutualFundTransaction): MutualFundTransaction | undefined {
        if (this.data[item.transactionId]) {
            this.data[item.transactionId] = item;
            return this.data[item.transactionId];
        }
    }

    generateId = (item: MutualFundTransaction): string => {
        let id = '';
        for (let key of item) {
            id = id + String(key);
        }
        return id;
    };
}

export const mutualFundStorage = new MutualFundStorage();
