import { accounts } from '../account-data.js';

export const _getAccounts = (req: any, res: any) => {
    res.send({ results: accounts, num_found: accounts.length });
};

export const _syncAccount = (req: any, res: any) => {
    const accountId = req.param.account;
};
