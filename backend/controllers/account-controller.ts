import { accountStorage } from '../storage/account-storage.js';
import { BankAccountTransactionSyncProvider } from '../workflows/bank-account-transaction-sync-provider.js';
import { AccountBuilder, AccountDtoBuilder } from '../models/account.js';
import { bankStorage } from '../storage/bank-storage.js';
import { Bank } from '../models/bank.js';

export const _getAccounts = (req: any, res: any) => {
    let banks: { [key: string]: Bank } = {};
    bankStorage.findAll({}).then((data) => {
        data.forEach((bank) => {
            banks[`${bank.id}`] = bank;
        });
    });
    accountStorage
        .findAll(req.body.criteria || {})
        .then((accounts) => {
            let results = accounts.map((account) => {
                let accountDto = AccountDtoBuilder.build(account);
                accountDto.bank = banks[account.bank];
                return accountDto;
            });
            res.send({ results: results, num_found: results.length });
        })
        .catch((reason) => {
            res.send({ results: [], num_found: 0 });
        });
};

export const _addAccount = (req: any, res: any) => {
    let account = AccountBuilder.build(req.body.data);
    accountStorage
        .add(account)
        .then((account) => {
            if (account) {
                res.send({ results: [account], num_found: 1 });
                let bankAccountTransactionSyncProvider = new BankAccountTransactionSyncProvider();
                if (account) {
                    bankAccountTransactionSyncProvider.syncInitial([account], false);
                }
            } else {
                res.send({ results: [], num_found: 0 });
            }
        })
        .catch((reason) => {
            res.send({ results: [], num_found: 0 });
        });
};

export const _syncAccount = (req: any, res: any) => {
    const accountId = req.param.account;
    let bankAccountTransactionSyncProvider = new BankAccountTransactionSyncProvider();
    accountStorage.find(accountId).then((account) => {
        if (!account) return;
        bankAccountTransactionSyncProvider.syncInitial([account], true);
    });
};

export const _syncAccounts = (req: any, res: any) => {
    let bankAccountTransactionSyncProvider = new BankAccountTransactionSyncProvider();
    accountStorage.findAll({ filters: [{ key: 'accountType', value: 'Bank Account' }] }).then((accounts) => {
        if (accounts.length === 0) return;
        bankAccountTransactionSyncProvider.syncInitial([...accounts], true);
    });
};
