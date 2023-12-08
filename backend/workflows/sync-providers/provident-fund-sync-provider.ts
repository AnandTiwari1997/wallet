import path from 'path';
import fs from 'fs';
import { Builder, By, until } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome.js';
import { dataChannel } from '../data-channel.js';
import { providentFundRepository } from '../../database/repository/provident-fund-repository.js';
import { ProvidentFundTransactionBuilder } from '../../database/models/provident-fund-transaction.js';
import { fileProcessor, SyncProvider } from './sync-provider.js';
import { captchaStorage } from '../../database/repository/captcha-storage.js';
import { rootDirectoryPath } from '../../server.js';
import { syncTrackerStorage } from '../../database/repository/sync-tracker-storage.js';
import { pfParam } from '../../config.js';
import { Logger } from '../../core/logger.js';

const logger: Logger = new Logger('ProvidentFundSyncProvider');

export class ProvidentFundSyncProvider implements SyncProvider<any> {
    sync(): void {
        (async function sync() {
            let downloadDirectory = path.resolve(rootDirectoryPath, 'reports', 'provident_fund');
            fs.rm(downloadDirectory, { recursive: true, force: true }, (err) => {
                if (err) {
                    logger.error(err);
                }
            });
            logger.info(`Removed Reports Folder`);
            let driverBuilder = new Builder().forBrowser('chrome');
            driverBuilder.setChromeOptions(
                new Options().setUserPreferences({ 'download.default_directory': downloadDirectory }).headless().windowSize({
                    width: 1200,
                    height: 1100
                })
            );
            let driver = await driverBuilder.build();
            let years: string[] = [];
            try {
                let id = new Date().getTime().toString();
                await driver.get('https://passbook.epfindia.gov.in/MemberPassBook/login');
                logger.info(`Opened https://passbook.epfindia.gov.in/MemberPassBook/login`);
                let username = await driver.findElement(By.id('username'));
                await username.sendKeys(pfParam.username);
                logger.info(`Entered Username`);
                let password = await driver.findElement(By.id('password'));
                await password.sendKeys(pfParam.password);
                logger.info(`Entered Password`);
                let imageElement = await driver.findElement(By.id('captcha_id'));
                let captchaInput = await driver.findElement(By.id('captcha'));
                imageElement.getAttribute('src').then((r) => {
                    const data = {
                        imageUrl: r,
                        captchaID: id
                    };
                    dataChannel.publish('sync', data);
                    dataChannel.deRegister('sync');
                });
                logger.info(`Captcha Image sent to Client`);
                let interval: NodeJS.Timeout;
                let captcha = await new Promise<string | undefined>((resolve) => {
                    interval = setInterval(() => {
                        if (captchaStorage.get(id)) {
                            resolve(captchaStorage.get(id)?.captchaText);
                            clearInterval(interval);
                        }
                    }, 1000);
                });
                if (!captcha) return [];
                await captchaInput.sendKeys(captcha);
                logger.info(`Entered Captcha`);
                await driver.findElement(By.id('login')).click();
                logger.info(`Clicked Login`);
                await driver.wait(until.elementLocated(By.xpath('//a[@data-name="passbook"]')), 10000);
                logger.info(`Located Passbook`);
                await driver.wait(until.elementIsVisible(driver.findElement(By.xpath('//a[@data-name="passbook"]'))), 10000);
                logger.info(`Passbook now visible`);
                await driver.findElement(By.xpath('//a[@data-name="passbook"]')).click();
                logger.info(`Clicked Passbook`);
                let elements = await driver.findElements(By.xpath('//*[@id="pb-container"]/div[1]/div/div'));
                years = await elements[0].getText().then((text) => text.split('\n'));
                logger.info(`Years ${years}`);
                for (let index = 0; index < elements.length; index++) {
                    const element = elements[index];
                    const texts = await element.getText().then((text) => text.split('\n'));
                    for (let text of texts) {
                        await driver.findElement(By.xpath(`//a[@data-year="${text}"]`)).click();
                        logger.info(`Clicked ${text}`);
                        await driver.sleep(5000);
                        await driver.wait(until.elementLocated(By.xpath(`//*[@id="v-tab-${text}"]/div/div/div[2]/button[2]`)), 10000);
                        logger.info(`Located Download As PDF`);
                        await driver.sleep(5000);
                        await driver.wait(until.elementIsVisible(driver.findElement(By.xpath(`//*[@id="v-tab-${text}"]/div/div/div[2]/button[2]`))), 10000);
                        logger.info(`Download As PDF Visible`);
                        await driver.sleep(5000);
                        await driver.findElement(By.xpath(`//*[@id="v-tab-${text}"]/div/div/div[2]/button[2]`)).click();
                        logger.info(`Clicked Download As PDf`);
                        await driver.sleep(5000);
                        await driver.wait(until.elementLocated(By.id('downloadPassbook')), 10000);
                        logger.info(`Located Download Passbook`);
                        await driver.sleep(5000);
                        await driver.wait(until.elementIsVisible(driver.findElement(By.id('downloadPassbook'))), 10000);
                        logger.info(`Download Passbook Visible`);
                        await driver.sleep(5000);
                        await driver.findElement(By.id('downloadPassbook')).click();
                        logger.info(`Clicked DownloadPassbook`);
                        await driver.sleep(5000);
                        await driver.findElement(By.xpath('//div[@class="modal-header modal-header1"]/button[@class="btn-close"]')).click();
                        logger.info(`Closed Download Modal`);
                        await driver.sleep(5000);
                    }
                }
                await driver.sleep(5000);
                await driver.findElement(By.id('logout')).click();
                logger.info(`Clicked Logout`);
                return years;
            } finally {
                await driver.quit();
            }
        })()
            .then((years) => {
                const pfData: { [key: string]: string }[] = [];
                for (let year of years) {
                    fileProcessor(
                        'provident_fund',
                        `PYBOM00464460000024760_${year}.pdf`,
                        `PYBOM00464460000024760_${year}_OUTPUT.json`,
                        '',
                        (data: any) => {
                            let newData = data.replaceAll("'", '"');
                            const parsedData: { [key: string]: string }[] = JSON.parse(newData);
                            for (let parseData of parsedData) {
                                providentFundRepository.add(ProvidentFundTransactionBuilder.build(parseData));
                            }
                            const syncTracker = syncTrackerStorage.get('provident_fund');
                            if (!syncTracker) return;
                            syncTracker.status = 'COMPLETED';
                            syncTracker.endTime = new Date();
                            syncTrackerStorage.update(syncTracker);
                        },
                        (data) => {
                            logger.error(data);
                        }
                    );
                }
            })
            .catch((reason) => {
                logger.error(reason);
                const syncTracker = syncTrackerStorage.get('provident_fund');
                if (!syncTracker) return;
                syncTracker.status = 'FAILED';
                syncTracker.endTime = new Date();
                syncTrackerStorage.update(syncTracker);
            });
    }

    manualSync(accounts: any[], deltaSync: boolean) {}
}
