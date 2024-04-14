import { By, IWebDriverCookie, WebDriver } from 'selenium-webdriver';
import { Logger } from '../../core/logger.js';
import fetch from 'node-fetch';
import { electricityParam } from '../../config.js';

const logger: Logger = new Logger('MaharashtraStateElectricityDistributionBillProcessor');

export class MaharashtraStateElectricityDistributionBillProcessor {
    async process(
        billConsumerNumber: string,
        driver: WebDriver
    ): Promise<{ billAmount: number; billDueDate: Date } | undefined> {
        try {
            await driver.get('https://wss.mahadiscom.in/wss/wss?uiActionName=getViewPayBill');
            logger.info(`Opened https://wss.mahadiscom.in/wss/wss?uiActionName=getViewPayBill`);
            await driver.sleep(2000);
            await driver.findElement(By.xpath('//input[@id="consumerNo"]')).sendKeys(billConsumerNumber);
            // await driver.findElement(By.xpath('//button[@id="btnCaptchaRefViewpaybill"]')).click();
            driver.sleep(2000);
            let webCookies: IWebDriverCookie[] = await driver.manage().getCookies();
            let cookies: string[] = webCookies.map((cookie) => `${cookie.name}=${cookie.value};`);
            let cookie = cookies.join(' ');
            driver.sleep(2000);
            let response = await fetch(
                'https://wss.mahadiscom.in/wss/wss?uiActionName=RefreshCaptchaViewPay&IsAjax=true',
                {
                    headers: {
                        accept: '*/*',
                        'accept-language': 'en-US,en;q=0.9',
                        'content-type': 'application/x-www-form-urlencoded',
                        'sec-ch-ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
                        'sec-ch-ua-mobile': '?0',
                        'sec-ch-ua-platform': '"macOS"',
                        'sec-fetch-dest': 'empty',
                        'sec-fetch-mode': 'cors',
                        'sec-fetch-site': 'same-origin',
                        cookie: cookie,
                        Referer: 'https://wss.mahadiscom.in/wss/wss?uiActionName=getViewPayBill',
                        'Referrer-Policy': 'strict-origin-when-cross-origin'
                    },
                    body: 'FormName=NewConnection',
                    method: 'POST'
                }
            );
            let body = await response.json();
            await driver.findElement(By.xpath('//input[@id="txtInput"]')).sendKeys(body as string);
            await driver.findElement(By.xpath('//button[@id="submitButton"]')).click();
            let amount = await driver
                .findElement(
                    By.xpath(electricityParam.MAHARASHTRA_STATE_ELECTRICITY_DISTRIBUTION_CO_LTD.bill_amount_xpath)
                )
                .getText();
            await driver.sleep(2000);
            let date = await driver
                .findElement(
                    By.xpath(electricityParam.MAHARASHTRA_STATE_ELECTRICITY_DISTRIBUTION_CO_LTD.due_date_xpath)
                )
                .getText();
            await driver.sleep(2000);
            return {
                billAmount: Number.parseFloat(amount),
                billDueDate: new Date(date)
            };
        } catch (e) {
            logger.error('Error while fetching electricity bill for consumer', billConsumerNumber);
            logger.error(e);
        } finally {
            await driver.quit();
        }
    }
}
