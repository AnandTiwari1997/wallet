import path from 'path';
import { Builder, By, until } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome.js';
import { Logger } from '../core/logger.js';
import { pfParam, rootDirectoryPath } from '../config.js';
import { PythonUtil } from '../utils/python-util.js';
import { ProvidentFundTransaction } from '../database/models/provident-fund-transaction.js';
import { providentFundRepository } from '../database/repository/provident-fund-repository.js';
import { syncTrackerRepository } from '../database/repository/sync-tracker-repository.js';
import { dataChannel } from '../utils/data-channel-util.js';
import { captchaStorage } from '../database/repository/captcha-storage.js';

const logger: Logger = new Logger('ProvidentFundSyncHandler');

export class ProvidentFundSyncHandler {
    sync(): void {
        (async function sync() {
            let downloadDirectory = path.resolve(rootDirectoryPath, 'reports', 'provident_fund');
            // fs.rm(downloadDirectory, { recursive: true, force: true }, (err) => {
            //     if (err) {
            //         logger.error(err);
            //     }
            // });
            logger.info(`Removed Reports Folder`);
            let driverBuilder = new Builder().forBrowser('chrome');
            driverBuilder.setChromeOptions(
                new Options()
                    .setUserPreferences({ 'download.default_directory': downloadDirectory })
                    .headless()
                    .windowSize({
                        width: 1200,
                        height: 1100
                    })
            );
            let driver = await driverBuilder.build();
            let years: string[] = [];
            try {
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
                let captchaId = new Date().getTime().toString();
                imageElement.getAttribute('src').then((r) => {
                    dataChannel.publish('sync', {
                        imageUrl: r,
                        captchaID: captchaId,
                        type: 'captcha'
                    });
                    dataChannel.deRegister('sync');
                });
                logger.info(`Captcha Image sent to Client`);
                let captchaInterval: NodeJS.Timeout;
                let captcha = await new Promise<string | undefined>((resolve) => {
                    captchaInterval = setInterval(() => {
                        if (captchaStorage.get(captchaId)) {
                            resolve(captchaStorage.get(captchaId)?.text);
                            clearInterval(captchaInterval);
                        }
                    }, 1000);
                });
                logger.info(captcha);
                if (!captcha) return [];
                captchaStorage.delete(captchaId);
                await captchaInput.sendKeys(captcha);
                logger.info(`Entered Captcha`);
                await driver.findElement(By.id('login')).click();
                logger.info(`Clicked Login`);
                let otpInterval: NodeJS.Timeout;
                let otp = await new Promise<string | undefined>((resolve) => {
                    otpInterval = setInterval(() => {
                        if (captchaStorage.get(captchaId)) {
                            resolve(captchaStorage.get(captchaId)?.text);
                            clearInterval(otpInterval);
                        }
                    }, 1000);
                });
                if (!otp) return [];
                let otpArray = otp.split('') || [];
                let otpInputs = await driver.findElements(By.xpath('//div[contains(@class, "otp-field")]/input'));
                for (let i = 0; i < otpArray.length; i++) {
                    await otpInputs[i].sendKeys(otpArray[i]);
                    await driver.sleep(1000);
                }
                logger.info(`Entered OTP`);
                await driver.findElement(By.xpath('//button[@name="login-otp-verification"]')).click();
                logger.info(`Clicked OTP Verify`);
                await driver.sleep(2000);
                await driver.wait(until.elementLocated(By.xpath('//a[@data-name="passbook"]')), 10000);
                logger.info(`Located Passbook`);
                await driver.wait(
                    until.elementIsVisible(driver.findElement(By.xpath('//a[@data-name="passbook"]'))),
                    10000
                );
                logger.info(`Passbook now visible`);
                await driver.findElement(By.xpath('//a[@data-name="passbook"]')).click();
                logger.info(`Clicked Passbook`);
                let elements = await driver.findElements(By.xpath('//*[@id="pb-container"]/div[1]/div/div'));
                years = await elements[0].getText().then((text) => text.split('\n'));
                logger.info(`Passbook will be processed for following Years ${years}`);
                for (let index = 0; index < elements.length; index++) {
                    const element = elements[index];
                    const texts = await element.getText().then((text) => text.split('\n'));
                    for (let text of texts) {
                        await driver.findElement(By.xpath(`//a[@data-year="${text}"]`)).click();
                        logger.info(`Clicked ${text}`);
                        await driver.sleep(5000);
                        await driver.wait(
                            until.elementLocated(By.xpath(`//div[@id="v-tab-${text}"]//button[@name="pb-pdf"]`)),
                            10000
                        );
                        logger.info(`Located Download As PDF`);
                        await driver.sleep(5000);
                        await driver.wait(
                            until.elementIsVisible(
                                driver.findElement(By.xpath(`//div[@id="v-tab-${text}"]//button[@name="pb-pdf"]`))
                            ),
                            10000
                        );
                        logger.info(`Download As PDF Visible`);
                        await driver.sleep(5000);
                        await driver
                            .findElement(By.xpath(`//div[@id="v-tab-${text}"]//button[@name="pb-pdf"]`))
                            .click();
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
                        await driver
                            .findElement(By.xpath('//div[@id="passbookModel"]//button[contains(@class,"btn-close")]'))
                            .click();
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
            .then(async (years) => {
                for (let year of years) {
                    logger.info(`Processing PF for ${year}`);
                    let data = PythonUtil.runSync([
                        'provident_fund',
                        `PYBOM00464460000024760_${year}.pdf`,
                        `PYBOM00464460000024760_${year}_OUTPUT.json`,
                        'AWDPT2993E'
                    ]);
                    if (!data) continue;
                    let newData = data.replaceAll("'", '"');
                    const parsedData: { [key: string]: string }[] = JSON.parse(newData);
                    logger.info(`${parsedData.length}`);
                    for (let parseData of parsedData) {
                        logger.info(`Parsed Data ${JSON.stringify(parseData)}`);
                        let providentFund = Object.assign(
                            ProvidentFundTransaction.prototype,
                            parseData
                        ) as ProvidentFundTransaction;
                        logger.info(`Provident Fund ${JSON.stringify(providentFund)}`);
                        providentFund.transaction_id = providentFundRepository.getTransactionId(providentFund);
                        let providentFundTransaction = await providentFundRepository.findOne({
                            where: {
                                transaction_id: providentFund.transaction_id
                            }
                        });
                        logger.info(`Found Provident Fund ${JSON.stringify(providentFundTransaction)}`);
                        if (!providentFundTransaction) {
                            await providentFundRepository.save(providentFund);
                        }
                    }
                    syncTrackerRepository
                        .findOne({
                            where: {
                                sync_type: 'provident_fund',
                                sync_status: 'IN_PROGRESS'
                            }
                        })
                        .then((syncTracker) => {
                            if (!syncTracker) return;
                            syncTracker.sync_status = 'COMPLETED';
                            syncTracker.sync_ended_at = new Date();
                            syncTrackerRepository.update(syncTracker.sync_type, syncTracker).then((r) => {});
                        });
                }
            })
            .catch((reason) => {
                logger.error(reason);
                syncTrackerRepository
                    .findOne({
                        where: {
                            sync_type: 'provident_fund',
                            sync_status: 'IN_PROGRESS'
                        }
                    })
                    .then((syncTracker) => {
                        if (!syncTracker) return;
                        syncTracker.sync_status = 'FAILED';
                        syncTracker.sync_ended_at = new Date();
                        syncTrackerRepository.update(syncTracker.sync_type, syncTracker).then((r) => {});
                    });
            });
    }

    manualSync(accounts: any[], deltaSync: boolean) {}
}
