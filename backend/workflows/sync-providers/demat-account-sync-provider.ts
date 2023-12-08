import { fileProcessorSync, SyncProvider } from './sync-provider.js';
import { DematAccount } from '../../database/models/demat-account.js';
import { connection, eventEmitter } from '../mail-service.js';
import { simpleParser } from 'mailparser';
import { Logger } from '../../core/logger.js';
import fs from 'fs';
import path from 'path';
import { rootDirectoryPath } from '../../server.js';
import { format, parse } from 'date-fns';
import { ALL_STOCKS, ArrayUtil } from '../../constant.js';
import { holdingRepository } from '../../database/repository/holding-repository.js';
import { StockTransaction } from '../../database/models/stock-transaction.js';
import { randomUUID } from 'crypto';
import { stockTransactionRepository } from '../../database/repository/stock-transaction-repository.js';
import fetch from 'node-fetch';
import { mfParam } from '../../config.js';
import { dematAccountRepository } from '../../database/repository/demat-account-repository.js';
import { ContractNoteProcessorFactory } from '../processor/processors.js';

const logger: Logger = new Logger('DematAccountSyncProvider');

class DematAccountSyncProvider implements SyncProvider<DematAccount> {
    manualSync(dematAccounts: DematAccount[], deltaSync: boolean): void {
        (async () => {
            for (let dematAccount of dematAccounts) {
                if (!dematAccount.broker) continue;
                let syncDate = deltaSync ? dematAccount.last_synced_on : dematAccount.start_date;
                connection.search(
                    [
                        ['SINCE', syncDate],
                        ['HEADER', 'FROM', dematAccount.broker.broker_email_id],
                        ['SUBJECT', 'CONTRACT NOTE']
                    ],
                    (error, uids) => {
                        if (error) {
                            logger.error(error.message);
                            return;
                        }
                        if (uids.length === 0) return;
                        let brokerUniqueDirName = `stock_${dematAccount.broker.broker_id}`;
                        if (fs.existsSync(path.resolve(rootDirectoryPath, 'reports', brokerUniqueDirName))) {
                            fs.rmSync(path.resolve(rootDirectoryPath, 'reports', brokerUniqueDirName), {
                                recursive: true,
                                force: true
                            });
                        }
                        let count = 1;
                        let processor = ContractNoteProcessorFactory.getProcessor(dematAccount.broker.broker_email_id);
                        if (!processor) return;
                        const iFetch = connection.fetch(uids, {
                            bodies: ''
                        });
                        let fileNo = 1;
                        let files: { [key: string]: boolean } = {};
                        iFetch.on('message', function (msg, sequenceNumber) {
                            msg.once('body', function (stream, info) {
                                simpleParser(stream, async (error, parsedMail) => {
                                    if (error) {
                                        logger.error(error.message);
                                        return;
                                    }
                                    if (!parsedMail.text && !parsedMail.html) return;
                                    if (!parsedMail.from?.value[0].address) return;
                                    if (parsedMail.attachments.length > 0) {
                                        if (!processor) return;
                                        let tradeDate = processor.process(parsedMail, dematAccount);
                                        if (!tradeDate) return;
                                        let attachment = parsedMail.attachments[0];
                                        const buffer = Buffer.from(attachment.content);
                                        fs.mkdirSync(path.resolve(rootDirectoryPath, 'reports', brokerUniqueDirName), {
                                            recursive: true
                                        });
                                        let fileName = attachment.filename ? attachment.filename.replace(' ', '_').replace(' ', '_') : 'contract_note.pdf';
                                        const names: string[] = fileName.split('.');
                                        fileName = names[0] + '_' + format(tradeDate, 'dd-MM-yyyy');
                                        if (files[fileName]) {
                                            fileNo++;
                                            return;
                                        }
                                        files[fileName] = true;
                                        logger.debug(`${fileNo}. ${fileName}.pdf`);
                                        fs.writeFileSync(path.resolve(rootDirectoryPath, 'reports', brokerUniqueDirName, `${fileName}.pdf`), buffer);
                                        let data: any = fileProcessorSync(brokerUniqueDirName, `${fileName}.pdf`, `${fileName}.json`, `${mfParam.panNo.toUpperCase()}`);
                                        let newData = data.replaceAll("'", '"');
                                        const parsedData: {
                                            [key: string]: string;
                                        }[] = JSON.parse(newData);
                                        if (fileNo === 1) eventEmitter.emit('stock', ['start', dematAccount]);
                                        eventEmitter.emit('stock', parsedData);
                                        if (fileNo === uids.length) eventEmitter.emit('stock', ['end', dematAccount]);
                                        fileNo++;
                                    }
                                });
                            });
                        });
                        iFetch.on('error', (error) => {
                            logger.error(`Error On Processing Mail ${error.message}`);
                        });
                        iFetch.on('end', () => {
                            logger.info(`All Stock Related Emails has been processed`);
                        });
                    }
                );
            }
        })();
    }

    sync(): void {
        eventEmitter.on('mail', (args) => {
            const mails: {
                numberOfNewMails: number;
                totalMails: number;
            } = args;
            const iFetch = connection.seq.fetch(`${Math.abs(mails.totalMails - mails.numberOfNewMails)}:${mails.totalMails}`, {
                bodies: ''
            });
            iFetch.on('message', function (msg, sequenceNumber) {
                msg.once('body', function (stream, info) {
                    simpleParser(stream, async (error, parsedMail) => {
                        if (error) {
                            logger.error(error.message);
                            return;
                        }
                        if (!parsedMail.text && !parsedMail.html) return;
                        if (!parsedMail.from?.value[0].address) return;
                        if (!parsedMail.subject || !parsedMail.subject?.toUpperCase().includes('CONTRACT NOTE')) return;
                        dematAccountRepository.findAll({}).then((dematAccounts) => {
                            for (let dematAccount of dematAccounts) {
                                let processor = ContractNoteProcessorFactory.getProcessor(dematAccount.broker.broker_email_id);
                                if (!processor) continue;
                                let from = parsedMail.from;
                                if (!from || !from.value || !from.value[0].address || !from.value[0].address.includes(dematAccount.broker.broker_email_id)) continue;
                                let brokerUniqueDirName = `stock_${dematAccount.broker.broker_id}`;
                                if (fs.existsSync(path.resolve(rootDirectoryPath, 'reports', brokerUniqueDirName))) {
                                    fs.rmSync(path.resolve(rootDirectoryPath, 'reports', brokerUniqueDirName), {
                                        recursive: true,
                                        force: true
                                    });
                                }
                                if (parsedMail.attachments.length > 0) {
                                    if (!processor) continue;
                                    let tradeDate = processor.process(parsedMail, dematAccount);
                                    if (!tradeDate) continue;
                                    let attachment = parsedMail.attachments[0];
                                    const buffer = Buffer.from(attachment.content);
                                    fs.mkdirSync(path.resolve(rootDirectoryPath, 'reports', brokerUniqueDirName), {
                                        recursive: true
                                    });
                                    let fileName = attachment.filename ? attachment.filename.replace(' ', '_').replace(' ', '_') : 'contract_note.pdf';
                                    const names: string[] = fileName.split('.');
                                    fileName = names[0] + '_' + format(tradeDate, 'dd-MM-yyyy');
                                    logger.debug(`${fileName}.pdf`);
                                    fs.writeFileSync(path.resolve(rootDirectoryPath, 'reports', brokerUniqueDirName, `${fileName}.pdf`), buffer);
                                    let data: any = fileProcessorSync(brokerUniqueDirName, `${fileName}.pdf`, `${fileName}.json`, `${mfParam.panNo.toUpperCase()}`);
                                    let newData = data.replaceAll("'", '"');
                                    const parsedData: {
                                        [key: string]: string;
                                    }[] = JSON.parse(newData);
                                    eventEmitter.emit('stock', ['start', dematAccount]);
                                    eventEmitter.emit('stock', parsedData);
                                    eventEmitter.emit('stock', ['end', dematAccount]);
                                }
                            }
                        });
                    });
                });
            });
            iFetch.on('error', (error) => {
                logger.error(`Error On Processing Mail ${error.message}`);
            });
            iFetch.on('end', () => {
                logger.info(`All Stock Related Emails has been processed`);
            });
        });
    }
}

let allStockData: {
    [key: string]: string;
}[] = [];
eventEmitter.on('stock', async (data: any[]) => {
    if (data[0] === 'start') {
        logger.info(`Processing started for ${(data[1] as DematAccount).account_name}`);
        allStockData = [];
    } else if (data[0] === 'end') {
        logger.info(`Processing ended for ${(data[1] as DematAccount).account_name}`);
        let dematAccount: DematAccount = data[1];
        allStockData = ArrayUtil.sort(allStockData, (item) => parse(item['transaction_date'], 'dd-MMM-yyyy HH:mm:ss', new Date()), true);
        for (let parseData of allStockData) {
            let exchange = parseData['order_no'].length == 16 ? 'NSE' : 'BSE';
            const stockInfo = ALL_STOCKS.find((value) => value.EXCHANGE === exchange && value.ISIN_NUMBER === parseData['stock_isin'].trim());
            if (!stockInfo) return;
            let holdingId = stockInfo.SYMBOL + '_' + dematAccount.account_bo_id;
            logger.debug(`${holdingId} - ${parseData['transaction_date']} - ${parseData['stock_quantity']} - ${parseData['amount']}`);
            let holding = await holdingRepository.find(holdingId);
            if (!holding || holding.current_price === 0) {
                let url: string = `https://www.groww.in/v1/api/stocks_data/v1/tr_live_prices/exchange/${exchange}/segment/CASH/${stockInfo?.SYMBOL_CODE || ''}/latest`;
                let currentPrice = 0;
                try {
                    let response = await fetch(url);
                    if (response) {
                        let data: any = await response.json();
                        currentPrice = Number.parseFloat(data['ltp']);
                    }
                } catch (e) {
                    logger.error(e);
                }
                let amountPerAccount: number = 0;
                let sharesPerAccount: number = 0;
                let exchanges: {
                    [key: string]: boolean;
                } = {};
                if (holding) {
                    amountPerAccount = Number.parseFloat(holding.invested_amount.toString(2));
                    sharesPerAccount = Number.parseFloat(holding.total_shares.toString(2));
                    exchanges = JSON.parse(holding.stock_exchange);
                } else {
                    amountPerAccount = 0;
                    sharesPerAccount = 0;
                    exchanges[exchange] = true;
                }
                holding = await holdingRepository.add({
                    holding_id: holdingId,
                    stock_name: stockInfo.NAME_OF_COMPANY || '',
                    stock_symbol_code: stockInfo.SYMBOL_CODE || '',
                    stock_symbol: stockInfo.SYMBOL || '',
                    stock_exchange: JSON.stringify(exchanges),
                    stock_isin: parseData['stock_isin'],
                    current_price: currentPrice,
                    invested_amount: amountPerAccount,
                    total_shares: sharesPerAccount,
                    account_id: dematAccount.account_bo_id
                });
            }
            if (!holding) return;
            let exchanges = JSON.parse(holding.stock_exchange);
            exchanges[exchange] = true;
            holding.total_shares = Number.parseFloat(holding.total_shares.toString(2)) + Number.parseFloat(parseData['stock_quantity']);
            if (holding.total_shares === 0) {
                holding.invested_amount = 0;
            } else {
                holding.invested_amount = Number.parseFloat(holding.invested_amount.toString(2)) + -1 * Number.parseFloat(parseData['amount']);
            }
            holding.stock_exchange = JSON.stringify(exchanges);
            const stock: StockTransaction = {
                transaction_id: randomUUID(),
                holding: holding,
                demat_account: dematAccount,
                transaction_date: parse(parseData['transaction_date'], 'dd-MMM-yyyy HH:mm:ss', new Date()),
                transaction_type: parseData['transaction_type'],
                stock_quantity: Math.abs(Number.parseFloat(parseData['stock_quantity'])),
                stock_transaction_price: Math.abs(Number.parseFloat(parseData['stock_transaction_price'])),
                amount: holding.invested_amount,
                dated: parse(parseData['transaction_date'], 'dd-MMM-yyyy HH:mm:ss', new Date())
            };
            await stockTransactionRepository.add(stock);
            await holdingRepository.update(holding);
        }
        let stocks = await stockTransactionRepository.findAll({});
        logger.info(`Data Stored Count ${stocks.length}`);
        dematAccount.last_synced_on = new Date();
        await dematAccountRepository.update(dematAccount);
    } else {
        allStockData.push(...data);
    }
});

export const dematAccountSyncProvider = new DematAccountSyncProvider();
