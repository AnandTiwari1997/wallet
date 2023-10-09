export const migrations: { [key: string]: string } = {
    V1: `CREATE TABLE IF NOT EXISTS bank
         (
             bank_id        INT8 NOT NULL,
             name           TEXT NOT NULL,
             icon           TEXT NOT NULL,
             alert_email_id TEXT NOT NULL,
             primary_color  TEXT NOT NULL,
             CONSTRAINT bank_id_pk PRIMARY KEY (bank_id)
         );`,
    V2: `CREATE TABLE IF NOT EXISTS account
         (
             account_id               INT8             NOT NULL,
             account_name             TEXT             NOT NULL,
             account_balance          DOUBLE PRECISION NOT NULL,
             initial_balance          DOUBLE PRECISION NOT NULL,
             bank_account_number      TEXT,
             account_type             TEXT             NOT NULL,
             account_icon             TEXT,
             account_background_color TEXT,
             bank_account_type        TEXT,
             bank                     INT8             NOT NULL,
             last_synced_on           TIMESTAMPTZ,
             CONSTRAINT account_id_pk PRIMARY KEY (account_id),
             CONSTRAINT accounts_bank_fk FOREIGN KEY (bank) REFERENCES bank (bank_id)
         );`,
    V3: `CREATE TABLE IF NOT EXISTS mutual_fund
         (
             transaction_id   TEXT             NOT NULL,
             fund_name        TEXT             NOT NULL,
             portfolio_number TEXT             NOT NULL,
             transaction_date TIMESTAMPTZ      NOT NULL,
             description      TEXT,
             amount           DOUBLE PRECISION NOT NULL,
             is_credit        BOOLEAN          NOT NULL,
             nav              DOUBLE PRECISION NOT NULL,
             units            DOUBLE PRECISION NOT NULL,
             latest_nav       DOUBLE PRECISION NOT NULL,
             CONSTRAINT mutual_fund_transactionId_pk PRIMARY KEY (transaction_id)
         );`,
    V4: `CREATE TABLE IF NOT EXISTS provident_fund
         (
             transaction_id        TEXT             NOT NULL,
             wage_month            TEXT             NOT NULL,
             financial_year        TEXT             NOT NULL,
             transaction_date      TIMESTAMPTZ      NOT NULL,
             description           TEXT,
             transaction_type      TEXT             NOT NULL,
             epf_amount            DOUBLE PRECISION NOT NULL,
             eps_amount            DOUBLE PRECISION NOT NULL,
             employee_contribution DOUBLE PRECISION NOT NULL,
             employer_contribution DOUBLE PRECISION NOT NULL,
             pension_amount        DOUBLE PRECISION NOT NULL,
             CONSTRAINT provident_fund_transactionId_pk PRIMARY KEY (transaction_id)
         );`,
    V5: `CREATE TABLE IF NOT EXISTS account_transaction
         (
             transaction_id    TEXT             NOT NULL,
             account           INT8             NOT NULL,
             transaction_date  TIMESTAMPTZ      NOT NULL,
             amount            DOUBLE PRECISION NOT NULL,
             category          TEXT             NOT NULL,
             labels            TEXT             NOT NULL,
             note              TEXT             NOT NULL,
             currency          TEXT             NOT NULL,
             payment_mode      TEXT             NOT NULL,
             transaction_type  TEXT             NOT NULL,
             transaction_state TEXT             NOT NULL,
             dated             DATE             NOT NULL,
             CONSTRAINT account_transaction_transactionId_pk PRIMARY KEY (transaction_id),
             CONSTRAINT account_transaction_account_fk FOREIGN KEY (account) REFERENCES account (account_id)
         );`
};
