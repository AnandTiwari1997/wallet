/**
 * @file Defines utility functions for repositories.
 * @author anandt1@
 */

import { AccountTransaction } from '../models/account-transaction.js';
import { MutualFundTransaction } from '../models/mutual-fund-transaction.js';
import { Between, FindOptionsOrder, FindOptionsWhere, In } from 'typeorm';
import { ApiCriteria } from '../../types/api-request-body-criteria.js';
import { FindOptionsGroupBy } from '../find-options/FindManyOptionsExtended.js';

/**
 * A utility class containing helper methods for repositories.
 */
export class RepositoryUtils {
    /**
     * Generates a unique ID for an account transaction.
     * @param {AccountTransaction} item - The account transaction item.
     * @returns {string} The generated unique ID.
     */
    static generateAccountTransactionId = (item: AccountTransaction): string => {
        return item.transaction_date.toISOString() + '_' + item.account.account_id.toString() + '_' + item.amount;
    };

    /**
     * Generates a unique ID for a mutual fund transaction.
     * @param {MutualFundTransaction} item - The mutual fund transaction item.
     * @returns {string} The generated unique ID.
     */
    static generateMutualFundTransactionId = (item: MutualFundTransaction): string => {
        return item.fund_name + '_' + item.portfolio_number + '_' + item.transaction_date + '_' + item.description;
    };

    /**
     * Constructs a TypeORM `FindOptionsWhere` clause from API criteria.
     * @param {ApiCriteria} [criteria] - The API criteria.
     * @returns {FindOptionsWhere<any>} The TypeORM `where` clause.
     */
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

    /**
     * Constructs a TypeORM `FindOptionsOrder` clause from API criteria.
     * @param {ApiCriteria} [criteria] - The API criteria.
     * @returns {FindOptionsOrder<any>} The TypeORM `order` clause.
     */
    static getSortClause = (criteria?: ApiCriteria): FindOptionsOrder<any> => {
        let sort: FindOptionsOrder<any> = {};
        criteria?.sorts?.map((item) => {
            sort[item.key] = item.ascending ? 'ASC' : 'DESC';
        });
        return sort;
    };

    /**
     * Constructs a TypeORM `FindOptionsGroupBy` clause from API criteria.
     * @param {ApiCriteria} [criteria] - The API criteria.
     * @returns {FindOptionsGroupBy<any>} The TypeORM `groupBy` clause.
     */
    static getGroupByClause = (criteria?: ApiCriteria): FindOptionsGroupBy<any> => {
        let groupBy: FindOptionsGroupBy<any> = {};
        criteria?.groupBy?.map((item) => {
            groupBy[item.key] = true;
        });
        return groupBy;
    };

    /**
     * Calculates the offset for pagination based on API criteria.
     * @param {ApiCriteria} [criteria] - The API criteria.
     * @returns {number} The calculated offset.
     */
    static getOffset = (criteria?: ApiCriteria): number => {
        let limit = criteria?.limit || 25;
        let offset = criteria?.offset || 0;
        return offset * limit;
    };
}
