import { Account, Bank, Bill, Broker, DematAccount, MutualFundTransaction, ProvidentFundTransaction, StockTransaction, Transaction } from '../../data/models';
import axios from 'axios';
import { Category, PaymentMode, TransactionStatus, TransactionType } from '../../data/transaction-data';

const API_PORT = 8000;
const API_URL = 'localhost';

export interface ApiResponse<T> {
    results: T[];
    num_found: number;
}

export interface ApiCriteria {
    filters?: {
        key: string;
        value: string;
    }[];
    sorts?: {
        key: string;
        ascending: boolean;
    }[];
    between?: {
        key: string;
        range: {
            start: string;
            end: string;
        };
    }[];
    offset?: number;
    limit?: number;
    groupBy?: {
        key: string;
    }[];
}

export interface ApiRequestBody<T> {
    data?: T;
    criteria?: ApiCriteria;
}

export const getBanks = async (apiRequestBody: ApiRequestBody<Bank> = {}): Promise<any> => {
    return await axios.post<ApiResponse<Bank>>(`http://${API_URL}:${API_PORT}/wallet/bank/_search`, {}).then((value) => value.data);
};

export const getAllTransactions = async (apiRequestBody: ApiRequestBody<Transaction>, dispatch: any): Promise<ApiResponse<Transaction>> => {
    dispatch(true);
    const response = await axios.post<ApiResponse<Transaction>>(`http://${API_URL}:${API_PORT}/wallet/transaction/_search`, apiRequestBody);
    let data = response.data.results.map<Transaction>((transaction) => {
        return {
            transaction_id: transaction.transaction_id,
            account: transaction.account,
            transaction_date: transaction.transaction_date,
            amount: transaction.amount,
            currency: transaction.currency,
            dated: transaction.dated,
            labels: transaction.labels,
            note: transaction.note,
            category: Category.getLabel(transaction.category.toString()),
            transaction_state: TransactionStatus.getLabel(transaction.transaction_state.toString()),
            transaction_type: TransactionType.getLabel(transaction.transaction_type.toString()),
            payment_mode: PaymentMode.getLabel(transaction.payment_mode.toString())
        };
    });
    return { results: data, num_found: response.data.num_found };
};

export const addTransaction = async (transaction: Transaction): Promise<ApiResponse<Transaction>> => {
    return await axios.post<any, ApiResponse<Transaction>, any>(
        `http://${API_URL}:${API_PORT}/wallet/transaction`,
        { data: transaction },
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
};

export const getAccounts = async (dispatch: any, apiRequestBody: ApiRequestBody<Transaction> = {}): Promise<ApiResponse<Account>> => {
    dispatch(true);
    const response = await axios.post(`http://${API_URL}:${API_PORT}/wallet/account/_search`, apiRequestBody);
    return { results: response.data.results, num_found: response.data.num_found };
};

export const addAccount = async (account: Account): Promise<ApiResponse<Account>> => {
    return await axios.post<any, ApiResponse<Account>, any>(
        `http://${API_URL}:${API_PORT}/wallet/account`,
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
        `http://${API_URL}:${API_PORT}/wallet/account`,
        { data: account },
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
};

export const syncAccount = async (
    apiRequest: ApiRequestBody<Account>
): Promise<{
    message: string;
}> => {
    return await axios.post<
        any,
        {
            message: string;
        },
        any
    >(`http://${API_URL}:${API_PORT}/wallet/account/sync`, apiRequest, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

export const syncAccounts = async (): Promise<{
    message: string;
}> => {
    return await axios.get<
        any,
        {
            message: string;
        },
        any
    >(`http://${API_URL}:${API_PORT}/wallet/account/sync`);
};

export const syncInvestmentAccount = (type: string): EventSource => {
    return new EventSource(`http://${API_URL}:${API_PORT}/wallet/investment/${type}/sync`);
};

export const syncInvestmentAccountCaptcha = async (
    type: string,
    captcha: ApiRequestBody<{
        [key: string]: string;
    }>
): Promise<any> => {
    return await axios.post(`http://${API_URL}:${API_PORT}/wallet/investment/${type}/sync/captcha`, captcha, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

export const getInvestmentsTransaction = async (type: string, requestBody: ApiRequestBody<MutualFundTransaction | ProvidentFundTransaction> = {}, dispatch: any): Promise<any> => {
    dispatch(true);
    let response = await axios.post<ApiResponse<MutualFundTransaction | ProvidentFundTransaction>>(`http://${API_URL}:${API_PORT}/wallet/investment/${type}/transaction`, requestBody, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    let data: (MutualFundTransaction | ProvidentFundTransaction)[] = response.data.results.map<MutualFundTransaction | ProvidentFundTransaction>(
        (transaction: MutualFundTransaction | ProvidentFundTransaction): MutualFundTransaction | ProvidentFundTransaction => {
            if (type === 'mutual_fund') {
                transaction = transaction as MutualFundTransaction;
                return {
                    transaction_id: transaction.transaction_id,
                    fund_name: transaction.fund_name,
                    transaction_date: new Date(transaction.transaction_date),
                    amount: transaction.amount,
                    units: transaction.units,
                    nav: transaction.nav,
                    latest_nav: transaction.latest_nav,
                    is_credit: transaction.is_credit,
                    portfolio_number: transaction.portfolio_number,
                    description: transaction.description
                };
            } else {
                transaction = transaction as ProvidentFundTransaction;
                return {
                    transaction_id: transaction.transaction_id,
                    wage_month: transaction.wage_month,
                    transaction_date: new Date(transaction.transaction_date),
                    description: transaction.description,
                    epf_amount: transaction.epf_amount,
                    eps_amount: transaction.eps_amount,
                    employee_contribution: transaction.employee_contribution,
                    employer_contribution: transaction.employer_contribution,
                    pension_amount: transaction.pension_amount,
                    is_credit: transaction.is_credit,
                    financial_year: transaction.financial_year
                };
            }
        }
    );

    return { results: data, num_found: response.data.num_found };
};

export const getBills = async (requestBody: ApiRequestBody<any> = {}, dispatch: any): Promise<ApiResponse<Bill>> => {
    dispatch(true);
    return await axios
        .post(`http://${API_URL}:${API_PORT}/wallet/bill/_search`, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((value) => value.data);
};

export const addBill = async (requestBody: ApiRequestBody<Bill> = {}): Promise<ApiResponse<Bill>> => {
    return await axios
        .post(`http://${API_URL}:${API_PORT}/wallet/bill`, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((value) => value.data);
};

export const updateBill = async (requestBody: ApiRequestBody<Bill> = {}): Promise<ApiResponse<Bill>> => {
    return await axios
        .put(`http://${API_URL}:${API_PORT}/wallet/bill`, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((value) => value.data);
};

export const getBroker = async (requestBody: ApiRequestBody<Broker> = {}): Promise<ApiResponse<Broker>> => {
    // dispatch(true);
    return await axios
        .post(`http://${API_URL}:${API_PORT}/wallet/stock/broker/_search`, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((value) => value.data);
};

export const getStockAccount = async (requestBody: ApiRequestBody<DematAccount> = {}, dispatch: any): Promise<ApiResponse<DematAccount>> => {
    dispatch(true);
    return await axios
        .post(`http://${API_URL}:${API_PORT}/wallet/stock/account/_search`, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((value) => value.data);
};

export const addStockAccount = async (requestBody: ApiRequestBody<DematAccount> = {}): Promise<ApiResponse<DematAccount>> => {
    return await axios
        .post(`http://${API_URL}:${API_PORT}/wallet/stock/account`, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((value) => value.data);
};

export const getStockTransaction = async (requestBody: ApiRequestBody<StockTransaction> = {}, dispatch: any): Promise<ApiResponse<StockTransaction>> => {
    dispatch(true);
    return await axios
        .post(`http://${API_URL}:${API_PORT}/wallet/stock/transaction/_search`, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((value) => value.data);
};
