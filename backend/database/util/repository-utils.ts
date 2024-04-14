import { AccountTransaction } from '../models/account-transaction.js';
import { MutualFundTransaction } from '../models/mutual-fund-transaction.js';
import { Between, FindOptionsOrder, FindOptionsWhere, In } from 'typeorm';
import { ApiCriteria } from '../../types/api-request-body-criteria.js';
import { FindOptionsGroupBy } from '../find-options/FindManyOptionsExtended.js';

export class RepositoryUtils {
    static generateAccountTransactionId = (item: AccountTransaction): string => {
        return item.transaction_date.toISOString() + '_' + item.account.account_id.toString() + '_' + item.amount;
    };

    static generateMutualFundTransactionId = (item: MutualFundTransaction): string => {
        return item.fund_name + '_' + item.portfolio_number + '_' + item.transaction_date + '_' + item.description;
    };

    static getWhereClause = (criteria?: ApiCriteria): FindOptionsWhere<any> => {
        let where: FindOptionsWhere<any> = {};
        criteria?.filters?.map((item) => {
            where[item.key] = In(item.value);
        });
        criteria?.between?.map((item) => {
            where[item.key] = Between(item.range.start, item.range.end);
        });
        return where;
    };

    static getSortClause = (criteria?: ApiCriteria): FindOptionsOrder<any> => {
        let sort: FindOptionsOrder<any> = {};
        criteria?.sorts?.map((item) => {
            sort[item.key] = item.ascending ? 'ASC' : 'DESC';
        });
        return sort;
    };

    static getGroupByClause = (criteria?: ApiCriteria): FindOptionsGroupBy<any> => {
        let groupBy: FindOptionsGroupBy<any> = {};
        criteria?.groupBy?.map((item) => {
            groupBy[item.key] = true;
        });
        return groupBy;
    };

    static getOffset = (criteria?: ApiCriteria): number => {
        let limit = criteria?.limit || 25;
        let offset = criteria?.offset || 0;
        return offset * limit;
    };
}
