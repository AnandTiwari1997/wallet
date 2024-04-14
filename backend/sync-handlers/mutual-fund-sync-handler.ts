import path from 'path';
import fs from 'fs';
import { By, until } from 'selenium-webdriver';
import { format, startOfMonth } from 'date-fns';
import { Logger } from '../core/logger.js';
import { mfParam, rootDirectoryPath } from '../config.js';
import { getFirefoxWebDriver } from '../utils/web-driver-util.js';
import { syncTrackerStorage } from '../database/repository/sync-tracker-storage.js';

const logger: Logger = new Logger('MutualFundSyncHandler');

export class MutualFundSyncHandler {
    sync(): void {
        (async function sync() {
            let downloadDirectory = path.resolve(rootDirectoryPath, 'reports', 'mutual_fund');
            fs.rm(downloadDirectory, { recursive: true, force: true }, (err) => {
                if (err) {
                    console.error(err);
                }
            });
            logger.info(`Removed Reports Folder`);
            let driver = await getFirefoxWebDriver(downloadDirectory);
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
                logger.info(`Selected From Date`);
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
                await driver.wait(
                    until.elementLocated(By.xpath(`//button[@type='submit' and @class='check-now-btn']`)),
                    10000
                );
                await driver.sleep(2000);
                logger.info(`Located //button[@type='submit' and @class='check-now-btn']`);
                await driver.wait(
                    until.elementIsVisible(
                        driver.findElement(By.xpath(`//button[@type='submit' and @class='check-now-btn']`))
                    ),
                    10000
                );
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
                if (success) {
                    logger.info(`Request has been submitted successfully.`);
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
