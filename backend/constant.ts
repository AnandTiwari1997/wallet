export const API_PATH = {
    BANKS: '/wallet/banks',
    // Account Endpoints
    ACCOUNTS: '/wallet/accounts',
    SYNC_ACCOUNTS: '/wallet/account/sync',

    // Transaction Endpoints
    TRANSACTIONS: '/wallet/transactions',

    // Investment Endpoints
    INVESTMENTS: '/wallet/investment'
};

export const MUTUAL_FUND = 'mutual_fund';
export const PROVIDENT_FUND = 'provident_fund';

export class ArrayUtil {
    static groupBy<T>(
        arr: T[],
        fn: (item: T) => string
    ): {
        [key: string]: T[];
    } {
        return arr.reduce<Record<string, T[]>>((prev, curr) => {
            const groupKey = fn(curr);
            const group = prev[groupKey] || [];
            group.push(curr);
            return { ...prev, [groupKey]: group };
        }, {});
    }

    static map<T, U>(arr: T[], fn: (item: T) => U): U[] {
        return arr.map(fn);
    }

    static sum<T>(arr: T[], fn: (item: T) => number): number {
        return arr.reduce((previousSum: number, currentItem: T) => {
            previousSum += fn(currentItem);
            return previousSum;
        }, 0);
    }

    static sort<T>(arr: T[], fn: (a: T) => any, ascending: boolean): T[] {
        return arr.sort((a: T, b: T) => {
            if (fn(a) > fn(b)) return ascending ? 1 : -1;
            if (fn(a) < fn(b)) return ascending ? -1 : 1;
            return 0;
        });
    }

    static filter<T>(arr: T[], fn: (item: T) => boolean): T[] {
        return arr.filter((currentItem) => fn(currentItem));
    }
}
