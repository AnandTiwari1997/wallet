import path from 'path';
import fs from 'fs';
import { Builder, By, until } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome.js';
import { dataChannel } from './data-channel.js';
import { providentFundStorage } from '../storage/provident-fund-storage.js';
import { ProvidentFundTransactionBuilder } from '../models/provident-fund-transaction.js';
import { fileProcessor, SyncProvider } from '../models/sync-provider.js';
import { captchaStorage } from '../storage/captcha-storage.js';
import { rootDirectoryPath } from '../server.js';
import { syncTrackerStorage } from '../storage/sync-tracker-storage.js';

export class ProvidentFundSyncProvider implements SyncProvider {
    sync(): void {
        (async function sync() {
            let downloadDirectory = path.resolve(rootDirectoryPath, 'reports', 'provident_fund');
            fs.rm(downloadDirectory, { recursive: true, force: true }, (err) => {
                if (err) {
                    console.error(err);
                }
            });
            console.log(`[ProvidentFundSyncProvider]: Removed Reports Folder`);
            let driverBuilder = new Builder().forBrowser('chrome');
            driverBuilder.setChromeOptions(
                new Options()
                    .setUserPreferences({ 'download.default_directory': downloadDirectory })
                    .headless()
                    .windowSize({ width: 1200, height: 1100 })
            );
            let driver = await driverBuilder.build();
            let years: string[] = [];
            try {
                let id = new Date().getTime().toString();
                await driver.get('https://passbook.epfindia.gov.in/MemberPassBook/login');
                console.log(
                    `[ProvidentFundSyncProvider]: Opened https://passbook.epfindia.gov.in/MemberPassBook/login`
                );
                let username = await driver.findElement(By.id('username'));
                await username.sendKeys('101563804709');
                console.log(`[ProvidentFundSyncProvider]: Entered Username`);
                let password = await driver.findElement(By.id('password'));
                await password.sendKeys('JaiShreeRam@2023');
                console.log(`[ProvidentFundSyncProvider]: Entered Password`);
                let imageElement = await driver.findElement(By.id('captcha_id'));
                let captchaInput = await driver.findElement(By.id('captcha'));
                imageElement.getAttribute('src').then((r) => {
                    console.log(r);
                    const data = {
                        imageUrl: r,
                        captchaID: id
                    };
                    dataChannel.publish('sync', data);
                    dataChannel.deRegister('sync');
                });
                console.log(`[ProvidentFundSyncProvider]: Captcha Image sent to Client`);
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
                console.log(`[ProvidentFundSyncProvider]: Entered Captcha`);
                await driver.findElement(By.id('login')).click();
                console.log(`[ProvidentFundSyncProvider]: Clicked Login`);
                await driver.wait(until.elementLocated(By.xpath('//a[@data-name="passbook"]')), 10000);
                console.log(`[ProvidentFundSyncProvider]: Located Passbook`);
                await driver.wait(
                    until.elementIsVisible(driver.findElement(By.xpath('//a[@data-name="passbook"]'))),
                    10000
                );
                console.log(`[ProvidentFundSyncProvider]: Passbook now visible`);
                await driver.findElement(By.xpath('//a[@data-name="passbook"]')).click();
                console.log(`[ProvidentFundSyncProvider]: Clicked Passbook`);
                let elements = await driver.findElements(By.xpath('//*[@id="pb-container"]/div[1]/div/div'));
                years = await elements[0].getText().then((text) => text.split('\n'));
                console.log(`[ProvidentFundSyncProvider]: Years ${years}`);
                for (let index = 0; index < elements.length; index++) {
                    const element = elements[index];
                    const texts = await element.getText().then((text) => text.split('\n'));
                    for (let text of texts) {
                        await driver.findElement(By.xpath(`//a[@data-year="${text}"]`)).click();
                        console.log(`[ProvidentFundSyncProvider]: Clicked ${text}]`);
                        await driver.sleep(5000);
                        await driver.wait(
                            until.elementLocated(By.xpath(`//*[@id="v-tab-${text}"]/div/div/div[2]/button[2]`)),
                            10000
                        );
                        console.log(`[ProvidentFundSyncProvider]: Located Download As PDF`);
                        await driver.sleep(5000);
                        await driver.wait(
                            until.elementIsVisible(
                                driver.findElement(By.xpath(`//*[@id="v-tab-${text}"]/div/div/div[2]/button[2]`))
                            ),
                            10000
                        );
                        console.log(`[ProvidentFundSyncProvider]: Download As PDF Visible`);
                        await driver.sleep(5000);
                        await driver.findElement(By.xpath(`//*[@id="v-tab-${text}"]/div/div/div[2]/button[2]`)).click();
                        console.log(`[ProvidentFundSyncProvider]: Clicked Download As PDf`);
                        await driver.sleep(5000);
                        await driver.wait(until.elementLocated(By.id('downloadPassbook')), 10000);
                        console.log(`[ProvidentFundSyncProvider]: Located Download Passbook`);
                        await driver.sleep(5000);
                        await driver.wait(until.elementIsVisible(driver.findElement(By.id('downloadPassbook'))), 10000);
                        console.log(`[ProvidentFundSyncProvider]: Download Passbook Visible`);
                        await driver.sleep(5000);
                        await driver.findElement(By.id('downloadPassbook')).click();
                        console.log(`[ProvidentFundSyncProvider]: Clicked DownloadPassbook`);
                        await driver.sleep(5000);
                        await driver
                            .findElement(
                                By.xpath('//div[@class="modal-header modal-header1"]/button[@class="btn-close"]')
                            )
                            .click();
                        console.log(`[ProvidentFundSyncProvider]: Closed Download Modal`);
                        await driver.sleep(5000);
                    }
                }
                await driver.sleep(5000);
                await driver.findElement(By.id('logout')).click();
                console.log(`[ProvidentFundSyncProvider]: Clicked Logout`);
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
                        (data: any) => {
                            let newData = data.replaceAll("'", '"');
                            const parsedData: { [key: string]: string }[] = JSON.parse(newData);
                            for (let parseData of parsedData) {
                                providentFundStorage.add(ProvidentFundTransactionBuilder.build(parseData));
                            }
                            const syncTracker = syncTrackerStorage.get('provident_fund');
                            if (!syncTracker) return;
                            syncTracker.status = 'COMPLETED';
                            syncTracker.endTime = new Date();
                            syncTrackerStorage.update(syncTracker);
                        }
                    );
                }
                console.log(`Data from the pipes:`);
                console.log(pfData);
            })
            .catch((reason) => {
                console.log(reason);
                const syncTracker = syncTrackerStorage.get('provident_fund');
                if (!syncTracker) return;
                syncTracker.status = 'FAILED';
                syncTracker.endTime = new Date();
                syncTrackerStorage.update(syncTracker);
            });
    }
}
