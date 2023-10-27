import { Account, Bill, Transaction } from '../../data/models';
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
    return await axios.get('http://localhost:8000/wallet/banks/_search').then((value) => value.data);
};

export const getAllTransactions = async (apiRequestBody: ApiRequestBody<Transaction>, dispatch: any): Promise<ApiResponse<Transaction>> => {
    dispatch(true);
    const response = await axios.post<ApiResponse<Transaction>>('http://localhost:8000/wallet/transactions/_search', apiRequestBody);
    return { results: response.data.results, num_found: response.data.num_found };
};

export const getAccounts = async (dispatch: any, apiRequestBody: ApiRequestBody<Transaction> = {}): Promise<ApiResponse<Account>> => {
    dispatch(true);
    const response = await axios.post('http://localhost:8000/wallet/accounts/_search', apiRequestBody);
    return { results: response.data.results, num_found: response.data.num_found };
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
    return await axios.post<any, { message: string }, any>(`http://localhost:8000/wallet/accounts/sync`, apiRequest, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

export const syncAccounts = async (): Promise<{ message: string }> => {
    return await axios.get<any, { message: string }, any>(`http://localhost:8000/wallet/accounts/sync`);
};

export const syncInvestmentAccount = (type: string): EventSource => {
    return new EventSource(`http://localhost:8000/wallet/investment/${type}/sync`);
};

export const syncInvestmentAccountCaptcha = async (
    type: string,
    captcha: ApiRequestBody<{
        [key: string]: string;
    }>
): Promise<any> => {
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

export const getBills = async (requestBody: ApiRequestBody<any> = {}, dispatch: any): Promise<ApiResponse<Bill>> => {
    dispatch(true);
    return await axios
        .post(`http://localhost:8000/wallet/bills`, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((value) => value.data);
};

export const addBill = async (requestBody: ApiRequestBody<Bill> = {}): Promise<ApiResponse<Bill>> => {
    return await axios
        .post(`http://localhost:8000/wallet/bills/add`, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((value) => value.data);
};

export const updateBill = async (requestBody: ApiRequestBody<Bill> = {}): Promise<ApiResponse<Bill>> => {
    return await axios
        .put(`http://localhost:8000/wallet/bills/update`, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((value) => value.data);
};
