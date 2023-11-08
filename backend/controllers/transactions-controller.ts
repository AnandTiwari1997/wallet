import { accountTransactionRepository } from '../database/repository/account-transaction-repository.js';
import { Transaction, TransactionBuilder, TransactionDto, TransactionType } from '../database/models/account-transaction.js';
import express, { Request, Response } from 'express';
import AsyncHandler from '../core/async-handler.js';
import { ApiResponseBody } from '../types/api-response-body.js';
import { ApiRequestBody } from '../types/api-request-body.js';
import { SuccessResponse } from '../core/api-response.js';
import { ApiRequestPathParam } from '../types/api-request-path-param.js';
import { BadRequestError, InternalError } from '../core/api-error.js';
import { accountRepository } from '../database/repository/account-repository.js';

const router = express.Router();
router.post(
    '/_search',
    AsyncHandler(async (req: Request<ApiRequestPathParam, ApiResponseBody<Transaction>, ApiRequestBody<Transaction>>, res: Response<ApiResponseBody<Transaction>>) => {
        let transactions = await accountTransactionRepository.findAllUsingGroupBy(req.body.criteria || {});
        let count = await accountTransactionRepository.count(req.body.criteria || {});
        let apiResponse: ApiResponseBody<Transaction> = {
            num_found: count,
            results: transactions
        };
        return new SuccessResponse<ApiResponseBody<Transaction>>(apiResponse).send(res);
    })
);
router.post(
    '/',
    AsyncHandler(async (req: Request<ApiRequestPathParam, ApiResponseBody<TransactionDto>, ApiRequestBody<TransactionDto>>, res: Response<ApiResponseBody<TransactionDto>>) => {
        let transactionDto = req.body.data;
        if (!transactionDto) throw new BadRequestError('Invalid transaction provided');
        let transaction = await accountTransactionRepository.add(TransactionBuilder.toTransaction(transactionDto));
        if (!transaction) throw new InternalError('Not able to add transaction');
        let apiResponse: ApiResponseBody<TransactionDto> = {
            num_found: 1,
            results: [TransactionBuilder.toTransactionDto(transaction)]
        };
        let account = (await accountRepository.find(transaction.account.account_id)) || transaction.account;
        account.account_balance = transaction.transaction_type === TransactionType.INCOME ? account.account_balance + transaction.amount : account.account_balance - transaction.amount;
        transaction.account = (await accountRepository.update(account)) || transaction.account;
        return new SuccessResponse<ApiResponseBody<TransactionDto>>(apiResponse).send(res);
    })
);
export default router;
