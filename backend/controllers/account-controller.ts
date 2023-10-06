import { accountStorage } from "../storage/account-storage.js";
import { BankAccountTransactionSyncProvider } from "../workflows/bank-account-transaction-sync-provider.js";

export const _getAccounts = (req: any, res: any) => {
  accountStorage
    .findAll({})
    .then((accounts) => {
      res.send({ results: accounts, num_found: accounts.length });
    })
    .catch((reason) => {
      res.send({ results: [], num_found: 0 });
    });
};

export const _syncAccount = (req: any, res: any) => {
  const accountId = req.param.account;
  let bankAccountTransactionSyncProvider =
    new BankAccountTransactionSyncProvider();
  accountStorage.find(accountId).then((account) => {
    if (!account) return;
    bankAccountTransactionSyncProvider.syncInitial([account]);
  });
};

export const _syncAllAccount = (req: any, res: any) => {
  let bankAccountTransactionSyncProvider =
    new BankAccountTransactionSyncProvider();
  accountStorage
    .findAll({ filters: [{ key: "accountType", value: "Bank Account" }] })
    .then((accounts) => {
      if (accounts.length === 0) return;
      bankAccountTransactionSyncProvider.syncInitial([...accounts]);
    });
};
