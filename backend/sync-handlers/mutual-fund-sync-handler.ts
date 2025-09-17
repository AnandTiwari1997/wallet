/**
 * @file This file contains the MutualFundSyncHandler class which is responsible for syncing mutual fund statements.
 * It uses selenium-webdriver to automate the process of downloading the statement from the CAMS website.
 */
import path from 'path';
import fs from 'fs';
import { By, until } from 'selenium-webdriver';
import { format, startOfMonth } from 'date-fns';
import { Logger } from '../core/logger.js';
import { mfParam, rootDirectoryPath } from '../config.js';
import { getFirefoxWebDriver } from '../utils/web-driver-util.js';
import { syncTrackerStorage } from '../database/repository/sync-tracker-storage.js';

const logger: Logger = new Logger('MutualFundSyncHandler');

/**
 * @class MutualFundSyncHandler
 * @description This class handles the synchronization of mutual fund statements.
 */
export class MutualFundSyncHandler {
    /**
     * @method sync
     * @description This method automates the process of downloading the mutual fund statement.
     */
    sync(): void {
        (async function sync() {
            // Define the download directory for the reports
            let downloadDirectory = path.resolve(rootDirectoryPath, 'reports', 'mutual_fund');
            // Remove the existing reports directory to ensure a clean slate
            fs.rm(downloadDirectory, { recursive: true, force: true }, (err) => {
                if (err) {
                    console.error(err);
                }
            });
            logger.info(`Removed Reports Folder`);
            // Initialize the Firefox WebDriver
            let driver = await getFirefoxWebDriver(downloadDirectory);
            try {
                // Navigate to the CAMS website
                await driver.get('https://www.camsonline.com/Investors/Statements/Consolidated-Account-Statement');
                logger.info(`Opened https://www.camsonline.com/Investors/Statements/Consolidated-Account-Statement`);
                await driver.sleep(2000);
                // Accept the consent
                await driver.findElement(By.xpath('//*[@id="mat-radio-9"]/label/span[2]/b')).click();
                logger.info(`Consent Accepted`);
                // Proceed to the next step
                await driver.findElement(By.xpath('//input[@type="button"]')).click();
                logger.info(`Clicked Proceed`);
                await driver.sleep(2000);
                // Close any pop-up dialogs
                try {
                    await driver.findElement(By.xpath('//div[contains(@class, "close-icon")]/mat-icon')).click();
                    await driver.sleep(2000);
                    await driver.findElement(By.xpath('//div[contains(@class, "close-icon")]/mat-icon')).click();
                    logger.info(`Closed Dialog`);
                } catch (e) {
                    logger.info(`No Closed Dialog`);
                }
                await driver.sleep(2000);
                // Select the 'Detailed' statement option
                await driver.findElement(By.id('mat-radio-3')).click();
                logger.info(`Selected Detailed`);
                await driver.sleep(2000);
                // Select the 'Specific Period' option
                await driver.findElement(By.id('mat-radio-14')).click();
                logger.info(`Selected Specific Period`);
                // Open the 'From' date picker
                await driver.findElement(By.xpath('//*[@data-mat-calendar="mat-datepicker-1"]/button')).click();
                await driver.sleep(2000);
                // Select the year 2020
                await driver
                    .findElement(By.xpath('//*[@id="mat-datepicker-1"]//button[@aria-label="Choose month and year"]'))
                    .click();
                await driver.sleep(2000);
                await driver
                    .findElement(By.xpath('//*[@id="mat-datepicker-1"]//mat-multi-year-view//td[@aria-label="2020"]'))
                    .click();
                // Select January 1, 2020
                await driver
                    .findElement(By.xpath('//*[@id="mat-datepicker-1"]//td[@aria-label="01-Jan-2020"]'))
                    .click();
                await driver.sleep(2000);
                await driver
                    .findElement(By.xpath('//*[@id="mat-datepicker-1"]//td[@aria-label="01-Jan-2020"]'))
                    .click();
                await driver.sleep(2000);
                logger.info(`Selected From Date`);
                // Open the 'To' date picker
                await driver.findElement(By.xpath('//*[@data-mat-calendar="mat-datepicker-2"]/button')).click();
                await driver.sleep(2000);
                // Select the current year
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
                // Select the first day of the current month
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
                // Select the current date
                await driver
                    .findElement(
                        By.xpath(`//*[@id="mat-datepicker-2"]//td[@aria-label="${format(new Date(), 'dd-MMM-yyyy')}"]`)
                    )
                    .click();
                await driver.sleep(2000);
                logger.info(`Selected To Date`);
                // Select the 'Non Zero Folio' option
                await driver.findElement(By.id('mat-radio-5')).click();
                await driver.sleep(2000);
                logger.info(`Selected Non Zero Folio`);
                // Enter the user's email
                await driver.findElement(By.id('mat-input-0')).sendKeys(mfParam.email);
                await driver.sleep(2000);
                logger.info(`Entered Email`);
                // Enter the user's PAN number
                await driver.findElement(By.id('mat-input-1')).sendKeys(mfParam.panNo);
                await driver.sleep(2000);
                logger.info(`Enter PAN`);
                // Enter the password
                await driver.findElement(By.id('mat-input-2')).sendKeys(mfParam.password);
                await driver.sleep(2000);
                logger.info(`Entered Password`);
                // Confirm the password
                await driver.findElement(By.id('mat-input-3')).sendKeys(mfParam.password);
                await driver.sleep(2000);
                logger.info(`Entered Password Again`);
                // Wait for the submit button to be located and visible
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
                // Click the submit button
                await driver.findElement(By.xpath(`//button[@type='submit' and @class='check-now-btn']`)).click();
                await driver.sleep(2000);
                logger.info(`Clicked Submit`);
                // Check for the success message
                return await driver
                    .findElement(By.xpath("//div[@class='success']"))
                    .getText()
                    .then((value) => value.includes('Success'));
            } finally {
                // Quit the driver
                await driver.quit();
            }
        })()
            .then((success) => {
                if (success) {
                    logger.info(`Request has been submitted successfully.`);
                }
            })
            .catch((reason) => {
                // Log any errors and update the sync tracker
                console.log(reason);
                const syncTracker = syncTrackerStorage.get('mutual_fund');
                if (!syncTracker) return;
                syncTracker.status = 'FAILED';
                syncTracker.endTime = new Date();
                syncTrackerStorage.update(syncTracker);
            });
    }
}
