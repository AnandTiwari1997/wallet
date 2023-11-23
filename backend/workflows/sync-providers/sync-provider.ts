import { ProvidentFundSyncProvider } from './provident-fund-sync-provider.js';
import { MutualFundSyncProvider } from './mutual-fund-sync-provider.js';
import { LOAN, MUTUAL_FUND, PROVIDENT_FUND, STOCK } from '../../constant.js';
import { spawn, spawnSync } from 'child_process';
import path from 'path';
import { rootDirectoryPath } from '../../server.js';
import fs from 'fs';
import { Logger } from '../../core/logger.js';
import { bankAccountTransactionSyncProvider } from './bank-account-transaction-sync-provider.js';
import { loanAccountTransactionSyncProvider } from './loan-account-transaction-sync-provider.js';
import { dematAccountSyncProvider } from './demat-account-sync-provider.js';

const logger: Logger = new Logger('SyncProvider');

export interface SyncProvider<T> {
    sync: () => void;
    manualSync: (accounts: T[], deltaSync: boolean) => void;
}

export class SyncProviderFactory {
    static getProvider = (name: string): SyncProvider<any> => {
        switch (name) {
            case MUTUAL_FUND:
                return new MutualFundSyncProvider();
            case PROVIDENT_FUND:
                return new ProvidentFundSyncProvider();
            case LOAN:
                return loanAccountTransactionSyncProvider;
            case STOCK:
                return dematAccountSyncProvider;
            default:
                return bankAccountTransactionSyncProvider;
        }
    };
}

export const syncProviderHelper = (name: string) => {
    let syncProvider: SyncProvider<any> = SyncProviderFactory.getProvider(name);
    syncProvider.sync();
};

export const fileProcessor = (syncType: string, inputFileName: string, outputFileName: string, filePassword: string, callback: (data: any) => void, error: (data: any) => void) => {
    const python = spawn(`python3`, [
        `${path.resolve(rootDirectoryPath, 'python', 'main.py')}`,
        syncType,
        `${path.resolve(rootDirectoryPath, 'reports', syncType, inputFileName)}`,
        `${path.resolve(rootDirectoryPath, 'reports', syncType, outputFileName)}`,
        `${filePassword}`
    ]);
    python.stdout.setEncoding('utf8');
    python.stdout.on('data', () => {
        try {
            const data = fs.readFileSync(path.resolve(rootDirectoryPath, 'reports', syncType, outputFileName), {
                encoding: 'utf8'
            });
            callback(data);
        } catch (e) {
            logger.error(e);
        }
    });
    python.stderr.setEncoding('utf8');
    python.stderr.on('data', error);
    python.on('close', (code) => {
        logger.info(`child process close all stdio with code ${code}`);
    });
};

export const fileProcessorSync = (syncType: string, inputFileName: string, outputFileName: string, filePassword: string) => {
    const python = spawnSync(`python3`, [
        `${path.resolve(rootDirectoryPath, 'python', 'main.py')}`,
        syncType,
        `${path.resolve(rootDirectoryPath, 'reports', syncType, inputFileName)}`,
        `${path.resolve(rootDirectoryPath, 'reports', syncType, outputFileName)}`,
        `${filePassword}`
    ]);
    if (python.status === 0) {
        return fs.readFileSync(path.resolve(rootDirectoryPath, 'reports', syncType, outputFileName), {
            encoding: 'utf8'
        });
    } else {
        logger.error(python.stderr.toString('utf8'));
        return undefined;
    }
};
