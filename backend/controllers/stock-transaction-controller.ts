import express, { Request, Response } from 'express';
import { AsyncApiHandler } from '../core/async-handler.js';
import { ApiResponseBody } from '../types/api-response-body.js';
import { ApiRequestBody } from '../types/api-request-body.js';
import { SuccessResponse } from '../core/api-response.js';
import { holdingRepository } from '../database/repository/holding-repository.js';
import { Logger } from '../core/logger.js';
import { ApiRequestPathParam } from '../types/api-request-path-param.js';
import { stockTransactionRepository } from '../database/repository/stock-transaction-repository.js';
import { StockTransaction } from '../database/models/stock-transaction.js';
import { RepositoryUtils } from '../database/util/repository-utils.js';
import { BadRequestError, InternalError } from '../core/api-error.js';
import { ArrayUtil } from '../constant.js';
import { FindOperator } from 'typeorm';
import { HttpRequestLogger } from '../core/api-middleware.js';

const logger: Logger = new Logger('StockTransactionController');

const router = express.Router();
router.use(HttpRequestLogger);
router.post(
    '/_search',
    AsyncApiHandler(
        async (
            req: Request<ApiRequestPathParam, ApiResponseBody<StockTransaction>, ApiRequestBody<StockTransaction>>,
            res: Response<ApiResponseBody<StockTransaction>>
        ) => {
            let where = RepositoryUtils.getWhereClause(req.body.criteria);
            let sort = RepositoryUtils.getSortClause(req.body.criteria);
            let groupBy = RepositoryUtils.getGroupByClause(req.body.criteria);
            let transactions = await stockTransactionRepository.findWithGroupBy({
                where: where,
                order: sort,
                groupBy: groupBy,
                limit: req.body.criteria?.limit,
                offset: RepositoryUtils.getOffset(req.body.criteria)
            });
            let count = await holdingRepository.count({
                where: {
                    total_shares: new FindOperator('moreThan', 0)
                }
            });
            let apiResponse: ApiResponseBody<StockTransaction> = {
                num_found: count,
                results: transactions
            };
            return new SuccessResponse<ApiResponseBody<StockTransaction>>(apiResponse).send(res);
        }
    )
);
router.post(
    '/',
    AsyncApiHandler(
        async (
            req: Request<ApiRequestPathParam, ApiResponseBody<StockTransaction>, ApiRequestBody<StockTransaction>>,
            res: Response<ApiResponseBody<StockTransaction>>
        ) => {
            let transactionDto = req.body.data;
            if (!transactionDto) throw new BadRequestError('Invalid transaction provided');
            let holding = transactionDto.holding;
            let transactions = await stockTransactionRepository.find({
                where: {
                    holding_id: holding.holding_id
                }
            });
            transactions = ArrayUtil.sort<StockTransaction>(
                [transactionDto, ...transactions],
                (item: StockTransaction) => item.transaction_date,
                true
            );
            logger.info(transactions);
            let totalShare = 0;
            let investedAmount = 0;
            for (let t of transactions) {
                totalShare = totalShare + (t.transaction_type === 'B' ? 1 : -1) * t.stock_quantity;
                if (totalShare === 0) {
                    investedAmount = 0;
                } else {
                    investedAmount =
                        investedAmount +
                        (t.transaction_type === 'B' ? 1 : -1) * (t.stock_quantity * t.stock_transaction_price);
                }
                const stock: StockTransaction = {
                    transaction_id: t.transaction_id,
                    holding_id: t.holding_id,
                    demat_account_id: t.demat_account_id,
                    holding: t.holding,
                    demat_account: t.demat_account,
                    transaction_date: t.transaction_date,
                    transaction_type: t.transaction_type,
                    stock_quantity: t.stock_quantity,
                    stock_transaction_price: t.stock_transaction_price,
                    amount: investedAmount,
                    dated: new Date(t.dated)
                };
                let stockFound = await stockTransactionRepository.find({
                    where: {
                        transaction_id: stock.transaction_id
                    }
                });
                if (stockFound) {
                    await stockTransactionRepository.update(stock.transaction_id, stock);
                } else {
                    let transactionNew = await stockTransactionRepository.save(stock);
                    if (!transactionNew) throw new InternalError('Not able to add transaction');
                    transactionDto = transactionNew;
                }
            }
            holding.total_shares = totalShare;
            holding.invested_amount = investedAmount;
            await holdingRepository.update(holding.holding_id, holding);
            transactionDto.holding = holding;
            let apiResponse: ApiResponseBody<StockTransaction> = {
                num_found: 1,
                results: [transactionDto]
            };
            return new SuccessResponse<ApiResponseBody<StockTransaction>>(apiResponse).send(res);
        }
    )
);
export default router;
