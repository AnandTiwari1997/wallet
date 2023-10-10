import { accountRepository } from '../database/repository/account-repository.js';
import { BankAccountTransactionSyncProvider } from '../workflows/sync-providers/bank-account-transaction-sync-provider.js';
import { Account } from '../database/models/account.js';
import express, { Request, Response } from 'express';
import AsyncHandler from '../core/async-handler.js';
import { BadRequestError, InternalError, NoDataError } from '../core/api-error.js';
import { SuccessResponse } from '../core/api-response.js';
import { ApiRequestBody } from '../types/api-request-body.js';
import { ApiResponseBody } from '../types/api-response-body.js';
import { ApiRequestPathParam } from '../types/api-request-path-param.js';

const router = express.Router();
router.get(
    '/',
    AsyncHandler(async (req: Request<ApiRequestPathParam, ApiResponseBody<Account>, ApiRequestBody<Account>>, res: Response<ApiResponseBody<Account>>) => {
        const accounts = await accountRepository.findAllWithRelation(req.body.criteria || {});
        let apiResponse: ApiResponseBody<Account> = {
            num_found: accounts.length,
            results: accounts
        };
        return new SuccessResponse<ApiResponseBody<Account>>(apiResponse).send(res);
    })
);
router.post(
    '/',
    AsyncHandler(async (req: Request<ApiRequestPathParam, ApiResponseBody<Account>, ApiRequestBody<Account>>, res: Response<ApiResponseBody<Account>>) => {
        let inputAccount = req.body.data;
        if (!inputAccount) throw new BadRequestError('Invalid input provided');
        let account = await accountRepository.add(inputAccount);
        if (!account) throw new InternalError('Not able to add account');
        let apiResponse: ApiResponseBody<Account> = {
            num_found: 1,
            results: [account]
        };
        return new SuccessResponse<ApiResponseBody<Account>>(apiResponse).send(res);
    })
);
router.put(
    '/',
    AsyncHandler(async (req: Request<ApiRequestPathParam, ApiResponseBody<Account>, ApiRequestBody<Account>>, res: Response<ApiResponseBody<Account>>) => {
        let inputAccount = req.body.data;
        if (!inputAccount) throw new BadRequestError('Invalid input provided');

        let foundedAccount = await accountRepository.find(inputAccount.account_id);
        if (!foundedAccount) throw new NoDataError('No account found');

        inputAccount.last_synced_on = new Date(foundedAccount.last_synced_on);
        let account = await accountRepository.update(inputAccount);

        if (!account) throw new InternalError('Not able to update account');
        let apiResponse: ApiResponseBody<Account> = {
            num_found: 1,
            results: [account]
        };
        return new SuccessResponse<ApiResponseBody<Account>>(apiResponse).send(res);
    })
);
router.delete(
    '/',
    AsyncHandler(
        async (
            req: Request<ApiRequestPathParam, { message: string }, ApiRequestBody<Account>>,
            res: Response<{
                message: string;
            }>
        ) => {
            let accounts = await accountRepository.findAll(req.body.criteria || {});
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
    AsyncHandler(
        async (
            req: Request<ApiRequestPathParam, { message: string }, ApiRequestBody<Account>>,
            res: Response<{
                message: string;
            }>
        ) => {
            let bankAccountTransactionSyncProvider = new BankAccountTransactionSyncProvider();
            let accounts = await accountRepository.findAll(req.body.criteria || {});
            if (accounts.length !== req.body.criteria?.filters?.length) {
                throw new BadRequestError('Invalid account Id provided for delete');
            }
            bankAccountTransactionSyncProvider.syncInitial(accounts, true);
            return new SuccessResponse<{
                message: string;
            }>({ message: 'Sync request has been submitted.' }).send(res);
        }
    )
);
export default router;
