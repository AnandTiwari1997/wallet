export const migrations: { [key: string]: string } = {
    V1: `CREATE TABLE IF NOT EXISTS accounts
         (
             id                     INTEGER PRIMARY KEY NOT NULL,
             accountName            TEXT                NOT NULL,
             accountBalance         REAL                NOT NULL,
             initialBalance         REAL                NOT NULL,
             bankAccountNumber      TEXT,
             accountType            TEXT                NOT NULL,
             accountIcon            TEXT,
             accountBackgroundColor TEXT,
             bankAccountType        TEXT
         );`,
    V2: `CREATE TABLE IF NOT EXISTS mutual_fund
         (
             transactionId   TEXT PRIMARY KEY NOT NULL,
             fundName        TEXT             NOT NULL,
             portfolioNumber TEXT             NOT NULL,
             transactionDate TEXT             NOT NULL,
             description     TEXT,
             amount          REAL             NOT NULL,
             isCredit        INTEGER          NOT NULL,
             nav             REAL             NOT NULL,
             units           REAL             NOT NULL,
             latestNav       REAL             NOT NULL
         );`,
    V3: `CREATE TABLE IF NOT EXISTS provident_fund
         (
             transactionId        TEXT PRIMARY KEY NOT NULL,
             wageMonth            TEXT             NOT NULL,
             financialYear        TEXT             NOT NULL,
             transactionDate      REAL             NOT NULL,
             description          TEXT,
             transactionType      TEXT             NOT NULL,
             epfAmount            REAL             NOT NULL,
             epsAmount            REAL             NOT NULL,
             employeeContribution REAL             NOT NULL,
             employerContribution REAL             NOT NULL,
             pensionAmount        REAL             NOT NULL
         );`,
    V4: `CREATE TABLE IF NOT EXISTS account_transaction
         (
             transactionId    TEXT PRIMARY KEY NOT NULL,
             account          TEXT             NOT NULL,
             transactionDate  TEXT             NOT NULL,
             amount           REAL             NOT NULL,
             category         TEXT             NOT NULL,
             labels           TEXT             NOT NULL,
             note             TEXT             NOT NULL,
             currency         TEXT             NOT NULL,
             paymentMode      TEXT             NOT NULL,
             transactionType  TEXT             NOT NULL,
             transactionState TEXT             NOT NULL
         );`,
    V5: `CREATE TABLE IF NOT EXISTS bank
         (
             id           INTEGER PRIMARY KEY NOT NULL,
             name         TEXT                NOT NULL,
             icon         TEXT                NOT NULL,
             alertEmailId TEXT                NOT NULL,
             primaryColor TEXT                NOT NULL
         );`,
    V6: `ALTER TABLE accounts
        ADD COLUMN bank INTEGER DEFAULT 0;`,
    V7: `ALTER TABLE account_transaction
        DROP COLUMN account;`,
    V8: `ALTER TABLE account_transaction
        ADD COLUMN account INTEGER NOT NULL DEFAULT 0;`,
    v9: `ALTER TABLE accounts
        ADD COLUMN lastSyncedOn TEXT;`,
    V10: `ALTER TABLE account_transaction
        ADD COLUMN date TEXT;`,
    V11: `UPDATE account_transaction
          SET date = substr(transactionDate, 0, 11);`
};
