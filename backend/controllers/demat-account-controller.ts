import express, { Request, Response } from 'express';
import AsyncHandler from '../core/async-handler.js';
import { ApiRequestPathParam } from '../types/api-request-path-param.js';
import { ApiResponseBody } from '../types/api-response-body.js';
import { ApiRequestBody } from '../types/api-request-body.js';
import { SuccessResponse } from '../core/api-response.js';
import { BadRequestError, InternalError } from '../core/api-error.js';
import { SyncProviderFactory } from '../workflows/sync-providers/sync-provider.js';
import { dematAccountRepository } from '../database/repository/demat-account-repository.js';
import { DematAccount, DematAccountBuilder, DematAccountDto } from '../database/models/demat-account.js';
import { dematAccountSyncProvider } from '../workflows/sync-providers/demat-account-sync-provider.js';

const router = express.Router();
router.post(
    '/_search',
    AsyncHandler(async (req: Request<ApiRequestPathParam, ApiResponseBody<DematAccountDto>, ApiRequestBody<DematAccountDto>>, res: Response<ApiResponseBody<DematAccountDto>>) => {
        const accounts = await dematAccountRepository.findAll(req.body.criteria || {});
        let apiResponse: ApiResponseBody<DematAccountDto> = {
            num_found: accounts.length,
            results: accounts.map((value) => DematAccountBuilder.toDematAccountDto(value))
        };
        return new SuccessResponse<ApiResponseBody<DematAccountDto>>(apiResponse).send(res);
    })
);
router.post(
    '/',
    AsyncHandler(async (req: Request<ApiRequestPathParam, ApiResponseBody<DematAccountDto>, ApiRequestBody<DematAccountDto>>, res: Response<ApiResponseBody<DematAccountDto>>) => {
        let clientAccount: DematAccountDto | undefined = req.body.data;
        if (!clientAccount) throw new BadRequestError('Invalid account provided');
        let inputAccount: DematAccount = DematAccountBuilder.toDematAccount(clientAccount);
        if (!inputAccount) throw new BadRequestError('Invalid account details provided');
        let account = await dematAccountRepository.add(inputAccount);
        if (!account) throw new InternalError('Not able to add account');
        let apiResponse: ApiResponseBody<DematAccountDto> = {
            num_found: 1,
            results: [DematAccountBuilder.toDematAccountDto(account)]
        };
        let syncProvider = SyncProviderFactory.getProvider(account.account_type);
        dematAccountSyncProvider.manualSync([account], false);
        return new SuccessResponse<ApiResponseBody<DematAccountDto>>(apiResponse).send(res);
    })
);
export default router;
