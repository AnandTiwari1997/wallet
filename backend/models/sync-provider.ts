import { ProvidentFundSyncProvider } from '../workflows/provident-fund-sync-provider.js';
import { MutualFundSyncProvider } from '../workflows/mutual-fund-sync-provider.js';
import { MUTUAL_FUND } from '../constant.js';
import { spawn } from 'child_process';
import path from 'path';
import { rootDirectoryPath } from '../server.js';
import fs from 'fs';

export interface SyncProvider {
    sync: () => void;
}

export class SyncProviderFactory {
    static getProvider = (name: string): SyncProvider => {
        if (name === MUTUAL_FUND) return new MutualFundSyncProvider();
        else return new ProvidentFundSyncProvider();
    };
}

export const syncProviderHelper = (name: string) => {
    let syncProvider: SyncProvider = SyncProviderFactory.getProvider(name);
    syncProvider.sync();
};

export const fileProcessor = (
    syncType: string,
    inputFileName: string,
    outputFileName: string,
    callback: (data: any) => void
) => {
    const python = spawn(`python3`, [
        `${path.resolve(rootDirectoryPath, 'python', 'main.py')}`,
        syncType,
        `${path.resolve(rootDirectoryPath, 'reports', syncType, inputFileName)}`,
        `${path.resolve(rootDirectoryPath, 'reports', syncType, outputFileName)}`
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
        console.log('stderr: ' + data);
    });
    python.on('close', (code) => {
        console.log(`child process close all stdio with code ${code}`);
    });
};
