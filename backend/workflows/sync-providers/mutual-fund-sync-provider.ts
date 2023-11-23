import { fileProcessor, SyncProvider } from './sync-provider.js';
import path from 'path';
import { rootDirectoryPath } from '../../server.js';
import fs from 'fs';
import { By, until } from 'selenium-webdriver';
import { getFirefoxWebDriver } from '../web-driver-util.js';
import { format, isAfter, startOfMonth } from 'date-fns';
import { connection, eventEmitter } from '../mail-service.js';
import { simpleParser } from 'mailparser';
import { syncTrackerStorage } from '../../database/repository/sync-tracker-storage.js';
import { mutualFundRepository } from '../../database/repository/mutual-fund-repository.js';
import { MutualFundTransactionBuilder } from '../../database/models/mutual-fund-transaction.js';
import { mfParam } from '../../config.js';
import { Logger } from '../../core/logger.js';

const logger: Logger = new Logger('MutualFundSyncProvider');

export class MutualFundSyncProvider implements SyncProvider<any> {
    sync(): void {
        (async function sync() {
            let downloadDirectory = path.resolve(rootDirectoryPath, 'reports', 'mutual_fund');
            fs.rm(downloadDirectory, { recursive: true, force: true }, (err) => {
                if (err) {
                    console.error(err);
                }
            });
            logger.info(`Removed Reports Folder`);
            let driver = await getFirefoxWebDriver(downloadDirectory, false);
            try {
                let id = new Date().getTime().toString();
                await driver.get('https://www.camsonline.com/Investors/Statements/Consolidated-Account-Statement');
                logger.info(`Opened https://www.camsonline.com/Investors/Statements/Consolidated-Account-Statement`);
                await driver.sleep(2000);
                await driver.findElement(By.xpath('//*[@id="mat-radio-9"]/label/span[2]/b')).click();
                logger.info(`Consent Accepted`);
                await driver.findElement(By.xpath('//input[@type="button"]')).click();
                logger.info(`Clicked Proceed`);
                await driver.sleep(2000);
                try {
                    await driver.findElement(By.xpath('//div[contains(@class, "close-icon")]/mat-icon')).click();
                    await driver.sleep(2000);
                    await driver.findElement(By.xpath('//div[contains(@class, "close-icon")]/mat-icon')).click();
                    logger.info(`Closed Dialog`);
                } catch (e) {
                    logger.info(`No Closed Dialog`);
                }
                await driver.sleep(2000);
                await driver.findElement(By.id('mat-radio-3')).click();
                logger.info(`Selected Detailed`);
                await driver.sleep(2000);
                await driver.findElement(By.id('mat-radio-14')).click();
                logger.info(`Selected Specific Period`);
                await driver.findElement(By.xpath('//*[@data-mat-calendar="mat-datepicker-1"]/button')).click();
                await driver.sleep(2000);
                await driver.findElement(By.xpath('//*[@id="mat-datepicker-1"]//button[@aria-label="Choose month and year"]')).click();
                await driver.sleep(2000);
                await driver.findElement(By.xpath('//*[@id="mat-datepicker-1"]//mat-multi-year-view//td[@aria-label="2020"]')).click();
                await driver.findElement(By.xpath('//*[@id="mat-datepicker-1"]//td[@aria-label="01-Jan-2020"]')).click();
                await driver.sleep(2000);
                await driver.findElement(By.xpath('//*[@id="mat-datepicker-1"]//td[@aria-label="01-Jan-2020"]')).click();
                await driver.sleep(2000);
                logger.info(`Selected From Date`);
                await driver.findElement(By.xpath('//*[@data-mat-calendar="mat-datepicker-2"]/button')).click();
                await driver.sleep(2000);
                await driver.findElement(By.xpath('//*[@id="mat-datepicker-2"]//button[@aria-label="Choose month and year"]')).click();
                await driver.sleep(2000);
                await driver.findElement(By.xpath(`//*[@id="mat-datepicker-2"]//mat-multi-year-view//td[@aria-label="${new Date().getFullYear()}"]`)).click();
                await driver.sleep(2000);
                await driver.findElement(By.xpath(`//*[@id="mat-datepicker-2"]//td[@aria-label="${format(startOfMonth(new Date()), 'dd-MMM-yyyy')}"]`)).click();
                await driver.sleep(2000);
                await driver.findElement(By.xpath(`//*[@id="mat-datepicker-2"]//td[@aria-label="${format(new Date(), 'dd-MMM-yyyy')}"]`)).click();
                await driver.sleep(2000);
                logger.info(`Selected To Date`);
                await driver.findElement(By.id('mat-radio-5')).click();
                await driver.sleep(2000);
                logger.info(`Selected Non Zero Folio`);
                await driver.findElement(By.id('mat-input-0')).sendKeys(mfParam.email);
                await driver.sleep(2000);
                logger.info(`Entered Email`);
                await driver.findElement(By.id('mat-input-1')).sendKeys(mfParam.panNo);
                await driver.sleep(2000);
                logger.info(`Enter PAN`);
                await driver.findElement(By.id('mat-input-2')).sendKeys(mfParam.password);
                await driver.sleep(2000);
                logger.info(`Entered Password`);
                await driver.findElement(By.id('mat-input-3')).sendKeys(mfParam.password);
                await driver.sleep(2000);
                logger.info(`Entered Password Again`);
                await driver.wait(until.elementLocated(By.xpath(`//button[@type='submit' and @class='check-now-btn']`)), 10000);
                await driver.sleep(2000);
                logger.info(`Located //button[@type='submit' and @class='check-now-btn']`);
                await driver.wait(until.elementIsVisible(driver.findElement(By.xpath(`//button[@type='submit' and @class='check-now-btn']`))), 10000);
                await driver.sleep(2000);
                logger.info(`Visible //button[@type='submit' and @class='check-now-btn']`);
                await driver.findElement(By.xpath(`//button[@type='submit' and @class='check-now-btn']`)).click();
                await driver.sleep(2000);
                logger.info(`Clicked Submit`);
                return await driver
                    .findElement(By.xpath("//div[@class='success']"))
                    .getText()
                    .then((value) => value.includes('Success'));
            } finally {
                await driver.quit();
            }
        })()
            .then((success) => {
                console.log(success);
                if (success) {
                    let date = new Date();
                    let getMFMail = (args: any[]) => {
                        logger.info(args);
                        try {
                            connection.search(
                                [
                                    ['FROM', 'donotreply@camsonline.com'],
                                    ['ON', date],
                                    ['SUBJECT', 'Consolidated Account Statement - CAMS Mailback Request']
                                ],
                                (error, mailIds) => {
                                    if (mailIds.length === 0) return;
                                    mailIds = mailIds.sort((a, b) => b - a);
                                    const iFetch = connection.fetch(mailIds[0], { bodies: '' });
                                    iFetch.on('message', (message) => {
                                        message.once('body', (stream) => {
                                            simpleParser(stream, async (error, parsedMail) => {
                                                if (!parsedMail.date) return;
                                                if (isAfter(parsedMail.date, date)) {
                                                    if (parsedMail.attachments.length > 0) {
                                                        let attachment = parsedMail.attachments[0];
                                                        const buffer = Buffer.from(attachment.content);
                                                        fs.mkdirSync(path.resolve(rootDirectoryPath, 'reports', 'mutual_fund'), {
                                                            recursive: true
                                                        });
                                                        const fileName = attachment.filename ? attachment.filename : 'anand_tiwari_mutual_fund';
                                                        fs.writeFileSync(path.resolve(rootDirectoryPath, 'reports', 'mutual_fund', `${fileName}.pdf`), buffer);
                                                        fileProcessor(
                                                            'mutual_fund',
                                                            `${fileName}.pdf`,
                                                            `${fileName}.json`,
                                                            `${mfParam.password}`,
                                                            async (data: any) => {
                                                                eventEmitter.removeListener('mail', getMFMail);
                                                                let newData = data.replaceAll("'", '"');
                                                                const parsedData: {
                                                                    [key: string]: string;
                                                                }[] = JSON.parse(newData);
                                                                for (let parseData of parsedData) {
                                                                    let mutualFund = MutualFundTransactionBuilder.build(parseData);
                                                                    let mfTransaction = await mutualFundRepository.find(mutualFundRepository.generateId(mutualFund));
                                                                    if (!mfTransaction) {
                                                                        await mutualFundRepository.add(mutualFund);
                                                                    }
                                                                }
                                                                const syncTracker = syncTrackerStorage.get('mutual_fund');
                                                                if (!syncTracker) return;
                                                                syncTracker.status = 'COMPLETED';
                                                                syncTracker.endTime = new Date();
                                                                syncTrackerStorage.update(syncTracker);
                                                            },
                                                            (data) => {}
                                                        );
                                                    }
                                                }
                                            });
                                        });
                                    });
                                    iFetch.on('error', (error) => {});
                                    iFetch.on('end', () => {
                                        console.log(`Messages has been processed`);
                                    });
                                }
                            );
                        } catch (error: any) {
                            console.log(`No Open MailBox.`);
                            eventEmitter.removeListener('mail', getMFMail);
                        }
                    };
                    console.log('Waiting for mail');
                    eventEmitter.prependOnceListener('mail', getMFMail);
                }
            })
            .catch((reason) => {
                console.log(reason);
                const syncTracker = syncTrackerStorage.get('mutual_fund');
                if (!syncTracker) return;
                syncTracker.status = 'FAILED';
                syncTracker.endTime = new Date();
                syncTrackerStorage.update(syncTracker);
            });
    }

    manualSync(accounts: any[], deltaSync: boolean) {}
}
