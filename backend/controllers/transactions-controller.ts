import express, { Request, Response } from 'express';
import { AsyncApiHandler } from '../core/async-handler.js';
import { ApiResponseBody } from '../types/api-response-body.js';
import { ApiRequestBody } from '../types/api-request-body.js';
import { SuccessResponse } from '../core/api-response.js';
import { ApiRequestPathParam } from '../types/api-request-path-param.js';
import { RepositoryUtils } from '../database/util/repository-utils.js';
import { BadRequestError, InternalError } from '../core/api-error.js';
import { AccountTransaction, TransactionType } from '../database/models/account-transaction.js';
import { accountTransactionRepository } from '../database/repository/account-transaction-repository.js';
import { accountRepository } from '../database/repository/account-repository.js';
import { HttpRequestLogger } from '../core/api-middleware.js';

const router = express.Router();
router.use(HttpRequestLogger);
router.post(
    '/_search',
    AsyncApiHandler(
        async (
            req: Request<ApiRequestPathParam, ApiResponseBody<AccountTransaction>, ApiRequestBody<AccountTransaction>>,
            res: Response<ApiResponseBody<AccountTransaction>>
        ) => {
            let where = RepositoryUtils.getWhereClause(req.body.criteria);
            let sort = RepositoryUtils.getSortClause(req.body.criteria);
            let groupBy = RepositoryUtils.getGroupByClause(req.body.criteria);
            let transactions = await accountTransactionRepository.findWithGroupBy({
                where: where,
                order: sort,
                groupBy: groupBy,
                limit: req.body.criteria?.limit,
                offset: RepositoryUtils.getOffset(req.body.criteria)
            });
            let count = await accountTransactionRepository.countWithGroupBy({
                where: where,
                groupBy: groupBy
            });
            let apiResponse: ApiResponseBody<AccountTransaction> = {
                num_found: count,
                results: transactions
            };
            return new SuccessResponse<ApiResponseBody<AccountTransaction>>(apiResponse).send(res);
        }
    )
);
router.post(
    '/',
    AsyncApiHandler(
        async (
            req: Request<ApiRequestPathParam, ApiResponseBody<AccountTransaction>, ApiRequestBody<AccountTransaction>>,
            res: Response<ApiResponseBody<AccountTransaction>>
        ) => {
            let transactionDto = req.body.data;
            if (!transactionDto) throw new BadRequestError('Invalid transaction provided');
            let transaction = await accountTransactionRepository.save(transactionDto);
            if (!transaction) throw new InternalError('Not able to add transaction');
            let apiResponse: ApiResponseBody<AccountTransaction> = {
                num_found: 1,
                results: [transaction]
            };
            let account =
                (await accountRepository.findOne({
                    where: {
                        account_id: transaction.account.account_id
                    }
                })) || transaction.account;
            account.account_balance =
                transaction.transaction_type === TransactionType.INCOME
                    ? account.account_balance + transaction.amount
                    : account.account_balance - transaction.amount;
            let updateResult = await accountRepository.update(account.account_id, account);
            if (updateResult.affected) {
                transaction.account =
                    (await accountRepository.findOne({
                        where: {
                            account_id: transaction.account.account_id
                        }
                    })) || transaction.account;
            }
            return new SuccessResponse<ApiResponseBody<AccountTransaction>>(apiResponse).send(res);
        }
    )
);
router.put(
    '/',
    AsyncApiHandler(
        async (
            req: Request<ApiRequestPathParam, ApiResponseBody<AccountTransaction>, ApiRequestBody<AccountTransaction>>,
            res: Response<ApiResponseBody<AccountTransaction>>
        ) => {
            let transactionDto = req.body.data;
            if (!transactionDto) throw new BadRequestError('Invalid transaction provided');
            let transaction = await accountTransactionRepository.update(transactionDto.transaction_id, transactionDto);
            if (!transaction.affected) throw new InternalError('Not able to update transaction');
            let transaction_ = await accountTransactionRepository.findOne({
                where: {
                    transaction_id: transactionDto.transaction_id
                }
            });
            if (!transaction_) throw new InternalError('Not able to update transaction');
            let apiResponse: ApiResponseBody<AccountTransaction> = {
                num_found: 1,
                results: [transaction_]
            };
            return new SuccessResponse<ApiResponseBody<AccountTransaction>>(apiResponse).send(res);
        }
    )
);
export default router;
