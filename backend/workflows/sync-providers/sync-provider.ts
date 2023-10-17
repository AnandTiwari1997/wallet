import { ProvidentFundSyncProvider } from './provident-fund-sync-provider.js';
import { MutualFundSyncProvider } from './mutual-fund-sync-provider.js';
import { MUTUAL_FUND, PROVIDENT_FUND } from '../../constant.js';
import { spawn } from 'child_process';
import path from 'path';
import { rootDirectoryPath } from '../../server.js';
import fs from 'fs';
import { Logger } from '../../core/logger.js';
import { bankAccountTransactionSyncProvider } from './bank-account-transaction-sync-provider.js';
import { loanAccountTransactionSyncProvider } from './loan-account-transaction-sync-provider.js';
import { Account } from '../../database/models/account.js';

const logger: Logger = new Logger('SyncProvider');

export interface SyncProvider {
    sync: () => void;
    manualSync: (accounts: Account[], deltaSync: boolean) => void;
}

export class SyncProviderFactory {
    static getProvider = (name: string): SyncProvider => {
        switch (name) {
            case MUTUAL_FUND:
                return new MutualFundSyncProvider();
            case PROVIDENT_FUND:
                return new ProvidentFundSyncProvider();
            case 'LOAN':
                return loanAccountTransactionSyncProvider;
            default:
                return bankAccountTransactionSyncProvider;
        }
    };
}

export const syncProviderHelper = (name: string) => {
    let syncProvider: SyncProvider = SyncProviderFactory.getProvider(name);
    syncProvider.sync();
};

export const fileProcessor = (syncType: string, inputFileName: string, outputFileName: string, filePassword: string, callback: (data: any) => void, error: () => void) => {
    const python = spawn(`python3`, [
        `${path.resolve(rootDirectoryPath, 'python', 'main.py')}`,
        syncType,
        `${path.resolve(rootDirectoryPath, 'reports', syncType, inputFileName)}`,
        `${path.resolve(rootDirectoryPath, 'reports', syncType, outputFileName)}`,
        `${filePassword}`
    ]);
    python.stdout.setEncoding('utf8');
    python.stdout.on('data', () => {
        const data = fs.readFileSync(path.resolve(rootDirectoryPath, 'reports', syncType, outputFileName), {
            encoding: 'utf8'
        });
        callback(data);
    });
    python.stderr.setEncoding('utf8');
    python.stderr.on('data', function (data) {
        logger.error('stderr: ' + data);
        error();
    });
    python.on('close', (code) => {
        logger.info(`child process close all stdio with code ${code}`);
    });
};
