import express, { Request, Response } from 'express';
import AsyncHandler from '../core/async-handler.js';
import { ApiResponseBody } from '../types/api-response-body.js';
import { ApiRequestBody } from '../types/api-request-body.js';
import { SuccessResponse } from '../core/api-response.js';
import { ApiRequestPathParam } from '../types/api-request-path-param.js';
import { BadRequestError, InternalError } from '../core/api-error.js';
import { StockTransaction, StockTransactionBuilder, StockTransactionDto } from '../database/models/stock-transaction.js';
import { stockTransactionRepository } from '../database/repository/stock-transaction-repository.js';
import { holdingRepository } from '../database/repository/holding-repository.js';
import { ArrayUtil } from '../constant.js';
import { Logger } from '../core/logger.js';

const logger: Logger = new Logger('StockTransactionController');

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
        let holding = transactionDto.holding;
        let transactions = await stockTransactionRepository.findAll({
            filters: [
                {
                    key: 'holding',
                    value: holding.holding_id
                }
            ]
        });
        let transaction = StockTransactionBuilder.toStockTransaction(transactionDto);
        transactions = ArrayUtil.sort<StockTransaction>([transaction, ...transactions], (item: StockTransaction) => item.transaction_date, true);
        logger.info(transactions);
        let totalShare = 0;
        let investedAmount = 0;
        for (let t of transactions) {
            totalShare = totalShare + (t.transaction_type === 'B' ? 1 : -1) * t.stock_quantity;
            if (totalShare === 0) {
                investedAmount = 0;
            } else {
                investedAmount = investedAmount + (t.transaction_type === 'B' ? 1 : -1) * (t.stock_quantity * t.stock_transaction_price);
            }
            const stock: StockTransaction = {
                transaction_id: t.transaction_id,
                holding: t.holding,
                demat_account: t.demat_account,
                transaction_date: t.transaction_date,
                transaction_type: t.transaction_type,
                stock_quantity: t.stock_quantity,
                stock_transaction_price: t.stock_transaction_price,
                amount: investedAmount,
                dated: new Date(t.dated)
            };
            let stockFound = await stockTransactionRepository.find(stock.transaction_id);
            if (stockFound) {
                await stockTransactionRepository.update(stock);
            } else {
                let transactionNew = await stockTransactionRepository.add(stock);
                if (!transactionNew) throw new InternalError('Not able to add transaction');
                transaction = transactionNew;
            }
        }
        holding.total_shares = totalShare;
        holding.invested_amount = investedAmount;
        await holdingRepository.update(holding);
        transaction.holding = holding;
        let apiResponse: ApiResponseBody<StockTransactionDto> = {
            num_found: 1,
            results: [StockTransactionBuilder.toStockTransactionDto(transaction)]
        };
        return new SuccessResponse<ApiResponseBody<StockTransactionDto>>(apiResponse).send(res);
    })
);
export default router;
