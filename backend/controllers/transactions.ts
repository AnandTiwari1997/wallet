import { accountTransactionStorage } from '../storage/account-transaction-storage.js';

export const _getTransactions = (req: any, res: any) => {
    const range = req.body;
    accountTransactionStorage
        .findAllUsingGroupBy(req.body.criteria)
        .then((transactions) => {
            accountTransactionStorage
                .count(req.body.criteria)
                .then((numFound) => {
                    res.send({ results: transactions, num_found: numFound });
                })
                .catch((reason) => res.send({ results: [], num_found: 0 }));
        })
        .catch((reason) => {
            res.send({ results: [], num_found: 0 });
        });
};

export const _getAccountTransactions = (req: any, res: any) => {
    accountTransactionStorage
        .findAll(req.body.criteria)
        .then((transactions) => {
            res.send({ results: transactions, num_found: transactions.length });
        })
        .catch((reason) => {
            res.send({ results: [], num_found: 0 });
        });
};
