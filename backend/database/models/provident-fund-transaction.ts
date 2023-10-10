import { parse } from 'date-fns';

export class ProvidentFundTransaction {
    transactionId: string;
    wageMonth: string;
    transactionDate: Date;
    description: string;
    epfAmount: number;
    epsAmount: number;
    employeeContribution: number;
    employerContribution: number;
    pensionAmount: number;
    transactionType: string;
    financialYear: string;

    constructor(
        transactionId: string,
        wageMonth: string,
        transactionDate: Date,
        description: string,
        transactionType: string,
        epfAmount: number,
        epsAmount: number,
        employeeContribution: number,
        employerContribution: number,
        pensionAmount: number,
        financialYear: string
    ) {
        this.transactionId = transactionId;
        this.wageMonth = wageMonth;
        this.transactionDate = transactionDate;
        this.description = description;
        this.epfAmount = epfAmount;
        this.transactionType = transactionType;
        this.epsAmount = epsAmount;
        this.employeeContribution = employeeContribution;
        this.employerContribution = employerContribution;
        this.pensionAmount = pensionAmount;
        this.financialYear = financialYear;
    }

    [Symbol.iterator]() {
        let array = [
            this.wageMonth,
            this.transactionDate,
            this.description,
            this.epfAmount,
            this.transactionType,
            this.epsAmount,
            this.employeeContribution,
            this.employerContribution,
            this.pensionAmount,
            this.financialYear
        ];
        let i = 0;
        return {
            next: function () {
                return { value: array[i++], done: i == array.length };
            }
        };
    }
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
    static build = (item: { [key: string]: any }) => {
        return new ProvidentFundTransaction(
            item.transactionId,
            item.wageMonth,
            parse(item.transactionDate, 'dd-MMM-yyyy', new Date(), {
                weekStartsOn: 0
            }),
            item.description,
            item.transactionType,
            item.epfAmount,
            item.epsAmount,
            item.employeeContribution,
            item.employerContribution,
            item.pensionAmount,
            item.financialYear
        );
    };

    static buildFromEntity = (item: { [key: string]: any }) => {
        return new ProvidentFundTransaction(
            item.transaction_id,
            item.wage_month,
            new Date(item.transaction_date),
            item.description,
            item.transaction_type,
            item.epf_amount,
            item.eps_amount,
            item.employee_contribution,
            item.employer_contribution,
            item.pension_amount,
            item.financial_year
        );
    };
}
