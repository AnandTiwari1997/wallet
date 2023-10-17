import { accountRepository } from '../database/repository/account-repository.js';
import { BankAccountTransactionSyncProvider } from '../workflows/sync-providers/bank-account-transaction-sync-provider.js';
import { Account, AccountBuilder, AccountDto } from '../database/models/account.js';
import express, { Request, Response } from 'express';
import AsyncHandler from '../core/async-handler.js';
import { BadRequestError, InternalError, NoDataError } from '../core/api-error.js';
import { SuccessResponse } from '../core/api-response.js';
import { ApiRequestBody } from '../types/api-request-body.js';
import { ApiResponseBody } from '../types/api-response-body.js';
import { ApiRequestPathParam } from '../types/api-request-path-param.js';
import { SyncProviderFactory } from '../workflows/sync-providers/sync-provider.js';

const router = express.Router();
router.get(
    '/',
    AsyncHandler(async (req: Request<ApiRequestPathParam, ApiResponseBody<AccountDto>, ApiRequestBody<AccountDto>>, res: Response<ApiResponseBody<AccountDto>>) => {
        const accounts = await accountRepository.findAll(req.body.criteria || {});
        let apiResponse: ApiResponseBody<AccountDto> = {
            num_found: accounts.length,
            results: accounts.map((account) => AccountBuilder.toAccountDto(account))
        };
        return new SuccessResponse<ApiResponseBody<AccountDto>>(apiResponse).send(res);
    })
);
router.post(
    '/',
    AsyncHandler(async (req: Request<ApiRequestPathParam, ApiResponseBody<AccountDto>, ApiRequestBody<AccountDto>>, res: Response<ApiResponseBody<AccountDto>>) => {
        let clientAccount: AccountDto | undefined = req.body.data;
        if (!clientAccount) throw new BadRequestError('Invalid account provided');
        let inputAccount: Account = AccountBuilder.toAccount(clientAccount);
        if (!inputAccount) throw new BadRequestError('Invalid account details provided');
        let account = await accountRepository.add(inputAccount);
        if (!account) throw new InternalError('Not able to add account');
        let apiResponse: ApiResponseBody<AccountDto> = {
            num_found: 1,
            results: [AccountBuilder.toAccountDto(account)]
        };
        let syncProvider = SyncProviderFactory.getProvider(account.account_type);
        syncProvider.manualSync([account], false);
        return new SuccessResponse<ApiResponseBody<AccountDto>>(apiResponse).send(res);
    })
);
router.put(
    '/',
    AsyncHandler(async (req: Request<ApiRequestPathParam, ApiResponseBody<AccountDto>, ApiRequestBody<AccountDto>>, res: Response<ApiResponseBody<AccountDto>>) => {
        let clientAccount: AccountDto | undefined = req.body.data;
        if (!clientAccount) throw new BadRequestError('Invalid account provided');
        let inputAccount: Account = AccountBuilder.toAccount(clientAccount);
        if (!inputAccount) throw new BadRequestError('Invalid account details provided');

        let foundedAccount = await accountRepository.find(inputAccount.account_id);
        if (!foundedAccount) throw new NoDataError('No account found');

        inputAccount.last_synced_on = new Date(foundedAccount.last_synced_on);
        let account = await accountRepository.update(inputAccount);

        if (!account) throw new InternalError('Not able to update account');
        let apiResponse: ApiResponseBody<AccountDto> = {
            num_found: 1,
            results: [AccountBuilder.toAccountDto(account)]
        };
        return new SuccessResponse<ApiResponseBody<AccountDto>>(apiResponse).send(res);
    })
);
router.delete(
    '/',
    AsyncHandler(
        async (
            req: Request<ApiRequestPathParam, { message: string }, ApiRequestBody<AccountDto>>,
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
            req: Request<ApiRequestPathParam, { message: string }, ApiRequestBody<AccountDto>>,
            res: Response<{
                message: string;
            }>
        ) => {
            let bankAccountTransactionSyncProvider = new BankAccountTransactionSyncProvider();
            let accounts = await accountRepository.findAll(req.body.criteria || {});
            bankAccountTransactionSyncProvider.manualSync(accounts, true);
            return new SuccessResponse<{
                message: string;
            }>({ message: 'Sync request has been submitted.' }).send(res);
        }
    )
);
export default router;
