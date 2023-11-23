import express, { Request, Response } from 'express';
import AsyncHandler from '../core/async-handler.js';
import { ApiResponseBody } from '../types/api-response-body.js';
import { ApiRequestBody } from '../types/api-request-body.js';
import { SuccessResponse } from '../core/api-response.js';
import { ApiRequestPathParam } from '../types/api-request-path-param.js';
import { BadRequestError, InternalError } from '../core/api-error.js';
import { StockTransactionBuilder, StockTransactionDto } from '../database/models/stock-transaction.js';
import { stockTransactionRepository } from '../database/repository/stock-transaction-repository.js';

const router = express.Router();
router.post(
    '/_search',
    AsyncHandler(async (req: Request<ApiRequestPathParam, ApiResponseBody<StockTransactionDto>, ApiRequestBody<StockTransactionDto>>, res: Response<ApiResponseBody<StockTransactionDto>>) => {
        let transactions = await stockTransactionRepository.findAllUsingGroupBy(req.body.criteria || {});
        let count = await stockTransactionRepository.count(req.body.criteria || {});
        let apiResponse: ApiResponseBody<StockTransactionDto> = {
            num_found: count,
            results: transactions.map((value) => StockTransactionBuilder.toStockTransactionDto(value))
        };
        return new SuccessResponse<ApiResponseBody<StockTransactionDto>>(apiResponse).send(res);
    })
);
router.post(
    '/',
    AsyncHandler(async (req: Request<ApiRequestPathParam, ApiResponseBody<StockTransactionDto>, ApiRequestBody<StockTransactionDto>>, res: Response<ApiResponseBody<StockTransactionDto>>) => {
        let transactionDto = req.body.data;
        if (!transactionDto) throw new BadRequestError('Invalid transaction provided');
        let transaction = await stockTransactionRepository.add(StockTransactionBuilder.toStockTransaction(transactionDto));
        if (!transaction) throw new InternalError('Not able to add transaction');
        let apiResponse: ApiResponseBody<StockTransactionDto> = {
            num_found: 1,
            results: [StockTransactionBuilder.toStockTransactionDto(transaction)]
        };
        return new SuccessResponse<ApiResponseBody<StockTransactionDto>>(apiResponse).send(res);
    })
);
export default router;
