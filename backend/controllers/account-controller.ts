import express, { Request, Response } from 'express';
import { BadRequestError, InternalError, NoDataError } from '../core/api-error.js';
import { ApiRequestPathParam } from '../types/api-request-path-param.js';
import { ApiResponseBody } from '../types/api-response-body.js';
import { ApiRequestBody } from '../types/api-request-body.js';
import { accountRepository } from '../database/repository/account-repository.js';
import { Account } from '../database/models/account.js';
import { SuccessResponse } from '../core/api-response.js';
import { RepositoryUtils } from '../database/util/repository-utils.js';
import {
    bankAccountTransactionSyncHandler,
    creditCardSyncHandler,
    loanAccountTransactionSyncHandler
} from '../singleton.js';
import { Logger } from '../core/logger.js';
import { HttpRequestLogger } from '../core/api-middleware.js';
import { AsyncApiHandler } from '../core/async-handler.js';

const logger = new Logger('AccountController');

function getProvider(account_type: string) {
    switch (account_type) {
        case 'BANK':
            return bankAccountTransactionSyncHandler;
        case 'LOAN':
            return loanAccountTransactionSyncHandler;
        default:
            return creditCardSyncHandler;
    }
}

const router = express.Router();
router.use(HttpRequestLogger);
router.post(
    '/_search',
    AsyncApiHandler(
        async (
            req: Request<ApiRequestPathParam, ApiResponseBody<Account>, ApiRequestBody<Account>>,
            res: Response<ApiResponseBody<Account>>
        ) => {
            let where = RepositoryUtils.getWhereClause(req.body.criteria);
            let sort = RepositoryUtils.getSortClause(req.body.criteria);
            let groupBy = RepositoryUtils.getGroupByClause(req.body.criteria);
            const accounts = await accountRepository.findWithGroupBy({
                where: where,
                order: sort,
                groupBy: groupBy,
                limit: req.body.criteria?.limit,
                offset: RepositoryUtils.getOffset(req.body.criteria),
                relations: { bank: true }
            });
            let apiResponse: ApiResponseBody<Account> = {
                num_found: accounts.length,
                results: accounts.map((account) => account)
            };
            return new SuccessResponse<ApiResponseBody<Account>>(apiResponse).send(res);
        }
    )
);
router.post(
    '/',
    AsyncApiHandler(
        async (
            req: Request<ApiRequestPathParam, ApiResponseBody<Account>, ApiRequestBody<Account>>,
            res: Response<ApiResponseBody<Account>>
        ) => {
            let clientAccount: Account | undefined = req.body.data;
            if (!clientAccount) throw new BadRequestError('Invalid account provided');
            let inputAccount: Account = Object.assign(Account.prototype, clientAccount);
            if (!inputAccount) throw new BadRequestError('Invalid account details provided');
            let account = await accountRepository.save(inputAccount);
            if (!account) throw new InternalError('Not able to add account');
            let apiResponse: ApiResponseBody<Account> = {
                num_found: 1,
                results: [account]
            };
            getProvider(account.account_type).sync([account], false);
            return new SuccessResponse<ApiResponseBody<Account>>(apiResponse).send(res);
        }
    )
);
router.put(
    '/',
    AsyncApiHandler(
        async (
            req: Request<ApiRequestPathParam, ApiResponseBody<Account>, ApiRequestBody<Account>>,
            res: Response<ApiResponseBody<Account>>
        ) => {
            let clientAccount: Account | undefined = req.body.data;
            if (!clientAccount) throw new BadRequestError('Invalid account provided');
            let inputAccount: Account = Object.assign(Account.prototype, clientAccount);
            if (!inputAccount) throw new BadRequestError('Invalid account details provided');
            let foundedAccount = await accountRepository.findOne({
                where: { account_id: inputAccount.account_id }
            });
            if (!foundedAccount) throw new NoDataError('No account found');
            inputAccount.last_synced_on = new Date(foundedAccount.last_synced_on);
            let account = await accountRepository.update(inputAccount.account_id, inputAccount);
            if (!account.affected) throw new InternalError('Not able to update account');
            let updatedAccount = await accountRepository.find({
                where: { account_id: inputAccount.account_id },
                relations: { bank: true }
            });
            let apiResponse: ApiResponseBody<Account> = {
                num_found: 1,
                results: [updatedAccount[0]]
            };
            return new SuccessResponse<ApiResponseBody<Account>>(apiResponse).send(res);
        }
    )
);
router.delete(
    '/',
    AsyncApiHandler(
        async (
            req: Request<ApiRequestPathParam, { message: string }, ApiRequestBody<Account>>,
            res: Response<{
                message: string;
            }>
        ) => {
            let accounts = await accountRepository.find({
                relations: { bank: true }
            });
            if (accounts.length !== req.body.criteria?.filters?.length) {
                throw new BadRequestError('Invalid account Id provided for delete');
            }
            for (let account of accounts) {
                await accountRepository.delete(account.account_id);
            }
            return new SuccessResponse<{
                message: string;
            }>({ message: 'Given accounts has been deleted' }).send(res);
        }
    )
);
router.post(
    '/sync',
    AsyncApiHandler(
        async (
            req: Request<ApiRequestPathParam, { message: string }, ApiRequestBody<Account>>,
            res: Response<{
                message: string;
            }>
        ) => {
            let where = RepositoryUtils.getWhereClause(req.body.criteria);
            let accounts = await accountRepository.find({
                where: where,
                relations: { bank: true }
            });
            logger.info(accounts);
            let bankAccounts = accounts.filter((account) => account.account_type === 'BANK');
            let loanAccounts = accounts.filter((account) => account.account_type === 'LOAN');
            let creditCardAccount = accounts.filter((account) => account.account_type === 'CREDIT_CARD');
            if (bankAccounts.length > 0) {
                bankAccountTransactionSyncHandler.sync(bankAccounts, true);
            }
            if (loanAccounts.length > 0) {
                loanAccountTransactionSyncHandler.sync(loanAccounts, true);
            }
            if (creditCardAccount.length > 0) {
                creditCardSyncHandler.sync(creditCardAccount, true);
            }
            return new SuccessResponse<{
                message: string;
            }>({ message: 'Sync request has been submitted.' }).send(res);
        }
    )
);
export default router;
