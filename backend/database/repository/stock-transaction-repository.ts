import { Logger } from '../../core/logger.js';
import { DataSource, Repository } from 'typeorm';
import { StockTransaction } from '../models/stock-transaction.js';
import { databaseProvider } from '../database-provider.js';
import { FindManyOptionsExtended } from '../find-options/FindManyOptionsExtended.js';
import { SelectQueryBuilderExtended } from '../query-builder/SelectQueryBuilderExtended.js';
import { DriverUtils } from 'typeorm/driver/DriverUtils.js';

const logger: Logger = new Logger('StockTransactionRepository');

class StockTransactionRepository extends Repository<StockTransaction> {
    private readonly dataSource: DataSource;

    constructor(dataSource: DataSource) {
        super(StockTransaction, dataSource.manager, dataSource.createQueryRunner());
        this.dataSource = dataSource;
    }

    createExtendedQueryBuilder(alias?: string): SelectQueryBuilderExtended<StockTransaction> {
        let selectQueryBuilderExtended = new SelectQueryBuilderExtended<StockTransaction>(
            this.dataSource,
            this.queryRunner
        );
        if (alias) {
            let alias_ = DriverUtils.buildAlias(this.dataSource.driver, undefined, alias);
            selectQueryBuilderExtended.select(alias_).from(this.metadata.target, alias_);
            return selectQueryBuilderExtended;
        } else {
            return selectQueryBuilderExtended;
        }
    }

    async findWithGroupBy(options: FindManyOptionsExtended<StockTransaction>): Promise<StockTransaction[]> {
        logger.info(`findWithGroupBy :: Fetch :: Start`);
        let innerQuery1 = this.createExtendedQueryBuilder('stock');
        innerQuery1.select('stock.holding_id', 'stock_holding_id');
        innerQuery1.addSelect(
            "SUM(CASE WHEN stock.transaction_type = 'B' THEN stock.stock_quantity ELSE 0 END) - SUM(CASE WHEN stock.transaction_type = 'S' THEN stock.stock_quantity ELSE 0 END)",
            'current_quantity'
        );
        innerQuery1.setFindOptionsExtended({
            where: options.where,
            groupBy: options.groupBy
        });
        let innerQuery = this.createExtendedQueryBuilder();
        innerQuery.addFrom(`(${innerQuery1.getQuery()})`, 'stock_custom');
        innerQuery.select('stock_holding_id');
        innerQuery.where('current_quantity > 0');
        innerQuery.addOrderBy('stock_holding_id', 'ASC');
        innerQuery.addGroupBy(`stock_holding_id`);
        if (options.limit) innerQuery.limit(options.limit);
        if (options.offset) innerQuery.offset(options.offset);
        let finalQuery = this.createExtendedQueryBuilder(this.metadata.targetName);
        finalQuery.where(`${this.metadata.targetName}.holding_id IN (${innerQuery.getQuery()})`);
        finalQuery.setFindOptionsExtended({
            order: options.order,
            relations: {
                holding: true,
                demat_account: true
            }
        });
        let parameters = innerQuery1.getParameters();
        for (let key in parameters) {
            finalQuery.setParameter(key, parameters[key]);
        }
        logger.debug(
            `findWithGroupBy :: Fetch :: Query - [${finalQuery.getSql()} :: Parameter - [${finalQuery.getParameters()}]`
        );
        logger.info(`findWithGroupBy :: Fetch :: End`);
        return await finalQuery.getMany();
    }
}

export const stockTransactionRepository = new StockTransactionRepository(databaseProvider.database);
