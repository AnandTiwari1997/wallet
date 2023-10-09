import { accountStorage } from '../storage/account-storage.js';
import { BankAccountTransactionSyncProvider } from '../workflows/bank-account-transaction-sync-provider.js';
import { AccountBuilder, IAccount } from '../models/account.js';

export const _getAccounts = (req: any, res: any) => {
    accountStorage
        .findAllWithRelation(req.body.criteria || {})
        .then((accounts) => {
            res.send({ results: accounts, num_found: accounts.length });
        })
        .catch((reason) => {
            res.send({ results: [], num_found: 0 });
        });
};

export const _addAccount = (req: any, res: any) => {
    let account = AccountBuilder.buildFromClient(req.body.data as IAccount);
    accountStorage
        .add(account)
        .then((account) => {
            if (account) {
                res.send({ results: [account], num_found: 1 });
                let bankAccountTransactionSyncProvider = new BankAccountTransactionSyncProvider();
                if (account && account.account_type === 'BANK') {
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

export const _updateAccount = (req: any, res: any) => {
    let account = AccountBuilder.buildFromClient(req.body.data as IAccount);
    accountStorage.find(account.account_id).then((foundAccount) => {
        if (!foundAccount) return;
        account.last_synced_on = new Date(foundAccount.last_synced_on);
        accountStorage
            .update(account)
            .then((account) => {
                if (account) {
                    res.send({ results: [account], num_found: 1 });
                    let bankAccountTransactionSyncProvider = new BankAccountTransactionSyncProvider();
                    if (account) {
                        bankAccountTransactionSyncProvider.syncInitial([account], true);
                    }
                } else {
                    res.send({ results: [], num_found: 0 });
                }
            })
            .catch((reason) => {
                res.send({ results: [], num_found: 0 });
            });
    });
};

export const _deleteAccount = (req: any, res: any) => {
    const accountId = Number.parseInt(req.params.account);
    accountStorage.delete(accountId).then((deleted) => res.send({ deleted: deleted }));
};

export const _syncAccounts = (req: any, res: any) => {
    let bankAccountTransactionSyncProvider = new BankAccountTransactionSyncProvider();
    accountStorage.findAll(req.body.criteria).then((accounts) => {
        if (accounts.length === 0) return;
        res.send({ message: 'Sync Request Accepted' });
        bankAccountTransactionSyncProvider.syncInitial(accounts, true);
    });
};
