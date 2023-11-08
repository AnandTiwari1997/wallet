import { parse } from 'date-fns';

export interface ProvidentFundTransaction {
    transaction_id: string;
    wage_month: string;
    transaction_date: Date;
    description: string;
    epf_amount: number;
    eps_amount: number;
    employee_contribution: number;
    employer_contribution: number;
    pension_amount: number;
    transaction_type: string;
    financial_year: string;
}

export interface IProvidentFundTransaction {
    transaction_id: string;
    wage_month: string;
    transaction_date: string;
    description: string;
    epf_amount: number;
    eps_amount: number;
    employee_contribution: number;
    employer_contribution: number;
    pension_amount: number;
    transaction_type: string;
    financial_year: string;
}

export class ProvidentFundTransactionBuilder {
    static build = (item: { [key: string]: any }): ProvidentFundTransaction => {
        return {
            transaction_id: item.transactionId,
            wage_month: item.wageMonth,
            transaction_date: parse(item.transactionDate, 'dd-MMM-yyyy', new Date(), {
                weekStartsOn: 0
            }),
            description: item.description,
            transaction_type: item.transactionType,
            epf_amount: item.epfAmount,
            eps_amount: item.epsAmount,
            employee_contribution: item.employeeContribution,
            employer_contribution: item.employerContribution,
            pension_amount: item.pensionAmount,
            financial_year: item.financialYear
        };
    };

    static buildFromEntity = (item: IProvidentFundTransaction): ProvidentFundTransaction => {
        return {
            transaction_id: item.transaction_id,
            wage_month: item.wage_month,
            transaction_date: new Date(item.transaction_date),
            description: item.description,
            transaction_type: item.transaction_type,
            epf_amount: item.epf_amount,
            eps_amount: item.eps_amount,
            employee_contribution: item.employee_contribution,
            employer_contribution: item.employer_contribution,
            pension_amount: item.pension_amount,
            financial_year: item.financial_year
        };
    };
}
