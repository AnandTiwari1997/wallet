import { PaymentMode, Transaction, TransactionStatus, TransactionType } from '../../data/transaction-data';
import { parse } from 'date-fns';
import { Account } from '../../data/account-data';
import axios from 'axios';

export interface ApiResponse<T> {
    results: T[];
    num_found: number;
}

export interface ApiCriteria {
    filters?: { key: string; value: string }[];
    sorts?: { key: string; ascending: boolean }[];
    between?: { key: string; range: { start: string; end: string } }[];
    offset?: number;
    limit?: number;
    groupBy?: { key: string }[];
}

export interface ApiRequestBody<T> {
    data?: T;
    criteria?: ApiCriteria;
}

export const getBanks = async (): Promise<any> => {
    return await axios.get('http://localhost:8000/wallet/banks').then((value) => value.data);
};

export const getAllTransactions = async (apiRequestBody: ApiRequestBody<Transaction>, dispatch: any): Promise<ApiResponse<Transaction>> => {
    dispatch(true);
    const response = await axios.post('http://localhost:8000/wallet/transactions', apiRequestBody, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const results = response.data.results.map(
        (value: {
            transactionId: string;
            account: number;
            transactionDate: string;
            amount: number;
            category: string;
            labels: string[];
            note: string;
            currency: string;
            paymentMode: PaymentMode;
            transactionType: TransactionType;
            transactionState: TransactionStatus;
        }) => {
            return new Transaction(
                value.transactionId,
                value.account,
                parse(value.transactionDate, "yyyy-MM-dd'T'HH:mm:ss.SSSX", new Date(), {
                    weekStartsOn: 0
                }),
                value.amount,
                value.category,
                value.labels,
                value.note,
                value.currency,
                value.paymentMode,
                value.transactionType,
                value.transactionState
            );
        }
    );
    return { results: results, num_found: response.data.num_found };
};

export const getAccounts = async (dispatch: any): Promise<ApiResponse<Account>> => {
    dispatch(true);
    const response = await fetch('http://localhost:8000/wallet/accounts');
    return response
        .json()
        .then((value) => {
            return { results: value.results, num_found: value.num_found };
        })
        .catch((reason) => {
            console.log(reason);
            return { results: [], num_found: 0 };
        });
};

export const addAccount = async (account: Account): Promise<ApiResponse<Account>> => {
    return await axios.post<any, ApiResponse<Account>, any>(
        'http://localhost:8000/wallet/accounts',
        { data: account },
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
};

export const updateAccount = async (account: Account): Promise<ApiResponse<Account>> => {
    return await axios.put<any, ApiResponse<Account>, any>(
        'http://localhost:8000/wallet/accounts',
        { data: account },
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
};

export const syncAccount = async (apiRequest: ApiRequestBody<Account>): Promise<{ message: string }> => {
    return await axios.post<any, { message: string }, any>(`http://localhost:8000/wallet/account/sync`, apiRequest, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

export const syncAccounts = async (): Promise<{ message: string }> => {
    return await axios.get<any, { message: string }, any>(`http://localhost:8000/wallet/account/sync`);
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

export const getInvestmentsTransaction = async (type: string, requestBody: ApiRequestBody<any> = {}, dispatch: any): Promise<any> => {
    dispatch(true);
    return await axios
        .post(`http://localhost:8000/wallet/investment/${type}/transactions`, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((value) => value.data);
};
