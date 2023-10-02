import { Transaction, transactions } from '../transaction-data.js';
import { isAfter, isBefore, isSameDay, parseISO } from 'date-fns';

export const _getTransactions = (req: any, res: any) => {
    const range = req.body;
    const results = transactions.filter((transaction) => {
        return (
            (isAfter(transaction.transactionDate, parseISO(range.from)) &&
                isBefore(transaction.transactionDate, parseISO(range.to))) ||
            isSameDay(transaction.transactionDate, parseISO(range.from)) ||
            isSameDay(transaction.transactionDate, parseISO(range.to))
        );
    });
    res.send({ results: results, num_found: results.length });
};

export const _getAccountTransactions = (req: any, res: any) => {
    const filteredData = transactions.filter((currentValue: Transaction) => {
        return currentValue.account.accountName === req.params.account;
    });
    res.send({ results: filteredData, num_found: filteredData.length });
};
