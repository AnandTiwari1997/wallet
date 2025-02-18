import {
    AccountTransaction,
    Category,
    PaymentMode,
    TransactionStatus,
    TransactionType
} from '../database/models/account-transaction.js';
import { Account } from '../database/models/account.js';
import { Bank } from '../database/models/bank.js';

export interface Deserializer<T> {
    deserialize(serialized: { [key: string]: string | object } | undefined): T | undefined;
}

export class AccountTransactionDeserializer implements Deserializer<AccountTransaction> {
    deserialize(serialized: { [p: string]: string | object } | undefined): AccountTransaction | undefined {
        if (!serialized) return undefined;
        let transactionId = serialized['transaction_id'] as string;
        let transactionType = serialized['transaction_type'] as TransactionType;
        let labels = serialized['labels'] as string[];
        let transactionDate = new Date(serialized['transaction_date'] as string);
        let transactionState = serialized['transaction_state'] as TransactionStatus;
        let dated = new Date(serialized['dated'] as string);
        let currency = serialized['currency'] as string;
        let paymentMode = serialized['payment_mode'] as PaymentMode;
        let note = serialized['note'] as string;
        let amount = Number.parseFloat(serialized['amount'] as string);
        let accountId = Number.parseInt(serialized['account_id'] as string);
        let category = serialized['category'] as Category;
        let account = new AccountDeserializer().deserialize(
            serialized['account'] as {
                [key: string]: string | object;
            }
        );
        if (account) {
            return new AccountTransaction(
                transactionId,
                accountId,
                account,
                transactionDate,
                amount,
                category,
                labels,
                note,
                currency,
                paymentMode,
                transactionType,
                transactionState,
                dated
            );
        }
        return undefined;
    }
}

export class AccountDeserializer implements Deserializer<Account> {
    deserialize(serialized: { [p: string]: string | object } | undefined): Account | undefined {
        if (!serialized) return undefined;
        let accountId = Number.parseInt(serialized['account_id'] as string);
        let accountName = serialized['account_name'] as string;
        let accountBalance = Number.parseFloat(serialized['account_balance'] as string);
        let accountType = serialized['account_type'] as string;
        let bankId = Number.parseInt(serialized['bank_id'] as string);
        let accountNumber = serialized['account_number'] as string;
        let startDate = new Date(serialized['start_date'] as string);
        let lastSyncedOn = new Date(serialized['last_synced_on'] as string);
        let searchText = serialized['search_text'] as string;
        let bank = new BankDeserializer().deserialize(serialized['bank'] as { [key: string]: string | object });
        if (bank) {
            return new Account(
                accountId,
                accountName,
                accountBalance,
                accountNumber,
                accountType,
                bankId,
                startDate,
                lastSyncedOn,
                searchText,
                bank
            );
        }
        return undefined;
    }
}

export class BankDeserializer implements Deserializer<Bank> {
    deserialize(serialized: { [p: string]: string | object } | undefined): Bank | undefined {
        if (!serialized) return undefined;
        let bankId = Number.parseInt(serialized['bank_id'] as string);
        let name = serialized['name'] as string;
        let icon = serialized['icon'] as string;
        let alertEmailId = serialized['alert_email_id'] as string;
        let primaryColor = serialized['primary_color'] as string;
        return new Bank(bankId, name, icon, alertEmailId, primaryColor);
    }
}
