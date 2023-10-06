import { bank, coins, moneyBall } from '../icons/icons';

export interface Account {
    id: number;
    accountName: string;
    accountBalance: number;
    initialBalance: number;
    bankAccountNumber?: string;
    accountType: string;
    accountIcon?: any;
    accountBackgroundColor?: string;
    bankAccountType?: string;
}

export const accounts: Account[] = [
    {
        id: 1,
        accountName: 'AXIS BANK',
        bankAccountNumber: '6789012345',
        initialBalance: 10000,
        accountIcon: bank,
        accountBackgroundColor: 'maroon',
        accountBalance: 10000,
        accountType: 'Bank Account',
        bankAccountType: 'Savings'
    },
    {
        id: 2,
        accountName: 'CASH',
        bankAccountNumber: '5678901234',
        initialBalance: 20000,
        accountIcon: coins,
        accountBackgroundColor: 'green',
        accountBalance: 20000,
        accountType: 'Cash'
    },
    {
        id: 3,
        accountName: 'STATE BANK OF INDIA',
        bankAccountNumber: '4567890123',
        initialBalance: 30000,
        accountIcon: moneyBall,
        accountBackgroundColor: 'blue',
        accountBalance: 30000,
        accountType: 'Bank Account',
        bankAccountType: 'Current'
    },
    {
        id: 4,
        accountName: 'BANK OF INDIA',
        bankAccountNumber: '3456789012',
        initialBalance: 40000,
        accountIcon: bank,
        accountBackgroundColor: 'purple',
        accountBalance: 40000,
        accountType: 'Bank Account',
        bankAccountType: 'Savings'
    },
    {
        id: 5,
        accountName: 'ICICI BANK',
        bankAccountNumber: '2345678901',
        initialBalance: 50000,
        accountIcon: bank,
        accountBackgroundColor: 'brown',
        accountBalance: 50000,
        accountType: 'Bank Account',
        bankAccountType: 'Savings'
    },
    {
        id: 6,
        accountName: 'UNRESERVED CASH',
        bankAccountNumber: '1234567890',
        initialBalance: 60000,
        accountIcon: coins,
        accountBackgroundColor: 'darkblue',
        accountBalance: 60000,
        accountType: 'Cash'
    }
];
