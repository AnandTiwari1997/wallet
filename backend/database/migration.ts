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
             account_id      INT8             NOT NULL,
             account_name    TEXT             NOT NULL,
             account_balance DOUBLE PRECISION NOT NULL,
             account_number  TEXT,
             account_type    TEXT             NOT NULL,
             bank            INT8             NOT NULL,
             start_date      TIMESTAMPTZ      NOT NULL,
             last_synced_on  TIMESTAMPTZ,
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
         );`,
    V6: `CREATE TABLE IF NOT EXISTS bill
         (
             bill_id            TEXT             NOT NULL,
             bill_name          TEXT             NOT NULL,
             vendor_name        TEXT             NOT NULL,
             bill_status        TEXT             NOT NULL,
             label              TEXT             NOT NULL,
             category           TEXT             NOT NULL,
             previous_bill_date DATE             NOT NULL,
             next_bill_date     DATE             NOT NULL,
             transaction_date   TIMESTAMPTZ,
             auto_sync          BOOLEAN          NOT NULL,
             bill_amount        DOUBLE PRECISION NOT NULL,
             bill_consumer_no   TEXT             NOT NULL,
             CONSTRAINT bill_id_pk PRIMARY KEY (bill_id)
         );`,
    V7: `CREATE TABLE IF NOT EXISTS stock_broker
         (
             broker_id            TEXT NOT NULL,
             broker_name          TEXT NOT NULL,
             broker_email_id      TEXT NOT NULL,
             broker_icon          TEXT NOT NULL,
             broker_primary_color TEXT NOT NULL,
             CONSTRAINT broker_id_pk PRIMARY KEY (broker_id)
         );`,
    V8: `CREATE TABLE IF NOT EXISTS demat_account
         (
             account_bo_id     TEXT        NOT NULL,
             account_client_id TEXT        NOT NULL,
             account_name      TEXT        NOT NULL,
             broker            TEXT        NOT NULL,
             start_date        TIMESTAMPTZ NOT NULL,
             last_synced_on    TIMESTAMPTZ,
             CONSTRAINT demat_account_bo_id_pk PRIMARY KEY (account_bo_id),
             CONSTRAINT stock_broker_fk FOREIGN KEY (broker) REFERENCES stock_broker (broker_id)
         )`,
    v9: `CREATE TABLE IF NOT EXISTS holding
        ( 
            holding_id                  TEXT NOT NULL, 
            stock_name                  TEXT NOT NULL, 
            stock_symbol_code           TEXT NOT NULL,
            stock_symbol                TEXT NOT NULL, 
            stock_exchange              TEXT NOT NULL,
            stock_isin                  TEXT NOT NULL,
            total_shares                TEXT NOT NULL,
            invested_amount             TEXT NOT NULL,
            current_price               DOUBLE PRECISION NOT NULL,
            CONSTRAINT holding_id_pk    PRIMARY KEY (holding_id)
        );`,
    V10: `CREATE TABlE IF NOT EXISTS stock
         (
             transaction_id             TEXT             NOT NULL,
             holding                    TEXT             NOT NULL,
             transaction_date           TIMESTAMPTZ      NOT NULL,
             transaction_type           TEXT             NOT NULL,
             stock_quantity             DOUBLE PRECISION NOT NULL,
             stock_transaction_price    DOUBLE PRECISION NOT NULL,
             amount                     DOUBLE PRECISION NOT NULL,
             dated                      DATE             NOT NULL,
             demat_account              TEXT NOT NULL,
             CONSTRAINT stock_transaction_id_pk PRIMARY KEY (transaction_id),
             CONSTRAINT holding_fk FOREIGN KEY (holding) REFERENCES holding (holding_id),
             CONSTRAINT demat_account_fk FOREIGN KEY (demat_account) REFERENCES demat_account (account_bo_id)
         );`
};
