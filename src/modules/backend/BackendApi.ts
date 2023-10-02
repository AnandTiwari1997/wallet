import { MutualFundTransaction, ProvidentFundTransaction, Transaction } from '../../data/transaction-data';
import { parse } from 'date-fns';
import { Account } from '../../data/account-data';
import axios from 'axios';

export interface ApiResponse<T> {
    results: T[];
    numFound: number;
}

export interface ApiCriteria {
    filters?: { key: string; value: string }[];
    sorts?: { key: string; ascending: boolean }[];
}

export interface ApiRequestBody<T> {
    data?: T;
    criteria?: ApiCriteria;
}

export const getAllTransactions = async (range: { from: Date; to: Date }): Promise<ApiResponse<Transaction>> => {
    const response = await axios.post('http://localhost:8000/wallet/transactions', range, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const results = response.data.results.map(
        (value: {
            transactionId: string;
            account: Account;
            transactionDate: string;
            amount: number;
            category: string;
            transactionType: string;
        }) => {
            return new Transaction(
                value.transactionId,
                value.account,
                parse(value.transactionDate, "yyyy-MM-dd'T'HH:mm:ss.SSSX", new Date(), {
                    weekStartsOn: 0
                }),
                value.amount,
                value.category,
                value.transactionType
            );
        }
    );
    return { results: results, numFound: results.length };
};

export const getAccounts = async (): Promise<ApiResponse<Account>> => {
    const response = await fetch('http://localhost:8000/wallet/accounts');
    return response
        .json()
        .then((value) => {
            return { results: value.results, numFound: value.numFound };
        })
        .catch((reason) => {
            console.log(reason);
            return { results: [], numFound: 0 };
        });
};

export const syncInvestmentAccount = (type: string): EventSource => {
    return new EventSource(`http://localhost:8000/wallet/investment/${type}/sync`);
};

export const syncInvestmentAccountCaptcha = async (type: string, captcha: { [key: string]: string }): Promise<any> => {
    return await axios.post(`http://localhost:8000/wallet/investment/${type}/sync/captcha`, captcha, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

export const getInvestmentsTransaction = async (type: string, requestBody: ApiRequestBody<any> = {}): Promise<any> => {
    return await axios
        .post(`http://localhost:8000/wallet/investment/${type}/transactions`, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((value) => value.data);
};
