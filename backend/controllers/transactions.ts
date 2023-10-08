import { accountTransactionStorage } from '../storage/account-transaction-storage.js';
import { Logger } from '../logger/logger.js';
import { TransactionDtoBuilder } from '../models/account-transaction.js';

const logger = new Logger('TransactionController');

export const _getTransactions = (req: any, res: any) => {
    logger.info(`Searching Transaction using ${JSON.stringify(req.body)}`);
    const range = req.body;
    accountTransactionStorage
        .findAllUsingGroupBy(req.body.criteria)
        .then((transactions) => {
            accountTransactionStorage
                .count(req.body.criteria)
                .then((numFound) => {
                    console.log(numFound);
                    let transactionDto = transactions?.map((value) => TransactionDtoBuilder.build(value));
                    res.send({ results: transactionDto, num_found: numFound });
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
            let transactionDto = transactions?.map((value) => TransactionDtoBuilder.build(value));
            res.send({ results: transactionDto, num_found: transactionDto?.length });
        })
        .catch((reason) => {
            res.send({ results: [], num_found: 0 });
        });
};
