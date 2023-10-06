import { parse } from "date-fns";

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
    transactionDate: string,
    description: string,
    transactionType: string,
    epfAmount: number,
    epsAmount: number,
    employeeContribution: number,
    employerContribution: number,
    pensionAmount: number,
    financialYear: string,
  ) {
    this.transactionId = transactionId;
    this.wageMonth = wageMonth;
    this.transactionDate = parse(transactionDate, "dd-MMM-yyyy", new Date(), {
      weekStartsOn: 0,
    });
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
      this.financialYear,
    ];
    let i = 0;
    return {
      next: function () {
        return { value: array[i++], done: i == array.length };
      },
    };
  }
}

export class ProvidentFundTransactionBuilder {
  static build = (item: { [key: string]: any }) => {
    return new ProvidentFundTransaction(
      item.transactionId,
      item.wageMonth,
      item.transactionDate,
      item.description,
      item.transactionType,
      item.epfAmount,
      item.epsAmount,
      item.employeeContribution,
      item.employerContribution,
      item.pensionAmount,
      item.financialYear,
    );
  };
}
