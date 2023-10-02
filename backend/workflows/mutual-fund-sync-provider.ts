import { fileProcessor, SyncProvider } from '../models/sync-provider.js';
import path from 'path';
import { rootDirectoryPath } from '../server.js';
import fs from 'fs';
import { By, until } from 'selenium-webdriver';
import { getFirefoxWebDriver } from './web-driver-util.js';
import { format, isAfter, startOfMonth } from 'date-fns';
import { connection } from './mail-service.js';
import { simpleParser } from 'mailparser';
import { mutualFundStorage } from '../storage/mutual-fund-storage.js';
import { MutualFundTransactionBuilder } from '../models/mutual-fund-transaction.js';
import { syncTrackerStorage } from '../storage/sync-tracker-storage.js';

export class MutualFundSyncProvider implements SyncProvider {
    sync(): void {
        (async function sync() {
            let downloadDirectory = path.resolve(rootDirectoryPath, 'reports', 'mutual_fund');
            fs.rm(downloadDirectory, { recursive: true, force: true }, (err) => {
                if (err) {
                    console.error(err);
                }
            });
            console.log(`[MutualFundSyncProvider]: Removed Reports Folder`);
            let driver = await getFirefoxWebDriver(downloadDirectory);
            try {
                let id = new Date().getTime().toString();
                await driver.get('https://www.camsonline.com/Investors/Statements/Consolidated-Account-Statement');
                console.log(
                    `[MutualFundSyncProvider]: Opened https://www.camsonline.com/Investors/Statements/Consolidated-Account-Statement`
                );
                await driver.sleep(2000);
                await driver.findElement(By.xpath('//*[@id="mat-radio-9"]/label/span[2]/b')).click();
                console.log(`[MutualFundSyncProvider]: Consent Accepted`);
                await driver.findElement(By.xpath('//input[@type="button"]')).click();
                console.log(`[MutualFundSyncProvider]: Clicked Proceed`);
                await driver.sleep(2000);
                await driver.findElement(By.xpath('//div[@class="close-icon"]/mat-icon')).click();
                console.log(`[MutualFundSyncProvider]: Closed Dialog`);
                await driver.sleep(2000);
                await driver.findElement(By.id('mat-radio-3')).click();
                console.log(`[MutualFundSyncProvider]: Selected Detailed`);
                await driver.sleep(2000);
                await driver.findElement(By.id('mat-radio-14')).click();
                console.log(`[MutualFundSyncProvider]: Selected Specific Period`);
                await driver.findElement(By.xpath('//*[@data-mat-calendar="mat-datepicker-1"]/button')).click();
                await driver.sleep(2000);
                await driver
                    .findElement(By.xpath('//*[@id="mat-datepicker-1"]//button[@aria-label="Choose month and year"]'))
                    .click();
                await driver.sleep(2000);
                await driver
                    .findElement(By.xpath('//*[@id="mat-datepicker-1"]//mat-multi-year-view//td[@aria-label="2020"]'))
                    .click();
                await driver
                    .findElement(By.xpath('//*[@id="mat-datepicker-1"]//td[@aria-label="01-Jan-2020"]'))
                    .click();
                await driver.sleep(2000);
                await driver
                    .findElement(By.xpath('//*[@id="mat-datepicker-1"]//td[@aria-label="01-Jan-2020"]'))
                    .click();
                await driver.sleep(2000);
                console.log(`[MutualFundSyncProvider]: Selected From Date`);
                await driver.findElement(By.xpath('//*[@data-mat-calendar="mat-datepicker-2"]/button')).click();
                await driver.sleep(2000);
                await driver
                    .findElement(By.xpath('//*[@id="mat-datepicker-2"]//button[@aria-label="Choose month and year"]'))
                    .click();
                await driver.sleep(2000);
                await driver
                    .findElement(
                        By.xpath(
                            `//*[@id="mat-datepicker-2"]//mat-multi-year-view//td[@aria-label="${new Date().getFullYear()}"]`
                        )
                    )
                    .click();
                await driver.sleep(2000);
                await driver
                    .findElement(
                        By.xpath(
                            `//*[@id="mat-datepicker-2"]//td[@aria-label="${format(
                                startOfMonth(new Date()),
                                'dd-MMM-yyyy'
                            )}"]`
                        )
                    )
                    .click();
                await driver.sleep(2000);
                await driver
                    .findElement(
                        By.xpath(`//*[@id="mat-datepicker-2"]//td[@aria-label="${format(new Date(), 'dd-MMM-yyyy')}"]`)
                    )
                    .click();
                await driver.sleep(2000);
                console.log(`[MutualFundSyncProvider]: Selected To Date`);
                await driver.findElement(By.id('mat-radio-5')).click();
                await driver.sleep(2000);
                console.log(`[MutualFundSyncProvider]: Selected Non Zero Folio`);
                await driver.findElement(By.id('mat-input-0')).sendKeys('anandtiwari887@gmail.com');
                await driver.sleep(2000);

                console.log(`[MutualFundSyncProvider]: Entered Email`);
                await driver.findElement(By.id('mat-input-1')).sendKeys('AWDPT2993E');
                await driver.sleep(2000);
                console.log(`[MutualFundSyncProvider]: Enter PAN`);
                await driver.findElement(By.id('mat-input-2')).sendKeys('Anand@1997');
                await driver.sleep(2000);
                console.log(`[MutualFundSyncProvider]: Entered Password`);
                await driver.findElement(By.id('mat-input-3')).sendKeys('Anand@1997');
                await driver.sleep(2000);
                console.log(`[MutualFundSyncProvider]: Entered Password Again`);
                await driver.wait(
                    until.elementLocated(By.xpath(`//button[@type='submit' and @class='check-now-btn']`)),
                    10000
                );
                await driver.sleep(2000);
                console.log(`[MutualFundSyncProvider]: Located //button[@type='submit' and @class='check-now-btn']`);
                await driver.wait(
                    until.elementIsVisible(
                        driver.findElement(By.xpath(`//button[@type='submit' and @class='check-now-btn']`))
                    ),
                    10000
                );
                await driver.sleep(2000);
                console.log(`[MutualFundSyncProvider]: Visible //button[@type='submit' and @class='check-now-btn']`);
                await driver.findElement(By.xpath(`//button[@type='submit' and @class='check-now-btn']`)).click();
                await driver.sleep(2000);
                console.log(`[MutualFundSyncProvider]: Clicked Submit`);
                return await driver
                    .findElement(By.xpath("//div[@class='success']"))
                    .getText()
                    .then((value) => value.includes('Success'));
            } finally {
                await driver.quit();
            }
        })()
            .then((success) => {
                if (success) {
                    let date = new Date();
                    connection.openBox('INBOX', true, (error, mailbox) => {
                        let date = new Date();
                        let interval = setInterval(() => {
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
                                                    console.log(parsedMail.subject);
                                                    console.log(parsedMail.date);
                                                    console.log(connection.state);
                                                    if (isAfter(parsedMail.date, date)) {
                                                        console.log(`Subject ${parsedMail.subject}`);
                                                        if (parsedMail.attachments.length > 0) {
                                                            for (let attachment of parsedMail.attachments) {
                                                                console.log(`Filename: ${attachment.filename}`);
                                                                console.log(`Content Type: ${attachment.contentType}`);
                                                                const buffer = Buffer.from(attachment.content);
                                                                fs.mkdirSync(
                                                                    path.resolve(
                                                                        rootDirectoryPath,
                                                                        'reports',
                                                                        'mutual_fund'
                                                                    ),
                                                                    {
                                                                        recursive: true
                                                                    }
                                                                );
                                                                const fileName = attachment.filename
                                                                    ? attachment.filename
                                                                    : 'anand_tiwari_mutual_fund';
                                                                fs.writeFileSync(
                                                                    path.resolve(
                                                                        rootDirectoryPath,
                                                                        'reports',
                                                                        'mutual_fund',
                                                                        `${fileName}.pdf`
                                                                    ),
                                                                    buffer
                                                                );
                                                                fileProcessor(
                                                                    'mutual_fund',
                                                                    `${fileName}.pdf`,
                                                                    `${fileName}.json`,
                                                                    (data: any) => {
                                                                        let newData = data.replaceAll("'", '"');
                                                                        const parsedData: { [key: string]: string }[] =
                                                                            JSON.parse(newData);
                                                                        for (let parseData of parsedData) {
                                                                            mutualFundStorage.add(
                                                                                MutualFundTransactionBuilder.build(
                                                                                    parseData
                                                                                )
                                                                            );
                                                                        }
                                                                        const syncTracker =
                                                                            syncTrackerStorage.get('mutual_fund');
                                                                        if (!syncTracker) return;
                                                                        syncTracker.status = 'COMPLETED';
                                                                        syncTracker.endTime = new Date();
                                                                        syncTrackerStorage.update(syncTracker);
                                                                    }
                                                                );
                                                            }
                                                            connection.openBox('INBOX', true, (error, mailbox) => {
                                                                connection.closeBox((error) => {
                                                                    console.log(error);
                                                                });
                                                            });
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
                                clearInterval(interval);
                            }
                        }, 60000);
                    });
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
}
