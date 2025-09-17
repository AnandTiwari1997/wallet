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
            // Navigate to the bill payment page
            await driver.get('https://wss.mahadiscom.in/wss/wss?uiActionName=getViewPayBill');
            logger.info(`Opened https://wss.mahadiscom.in/wss/wss?uiActionName=getViewPayBill`);
            await driver.sleep(2000);

            // Enter the consumer number
            await driver.findElement(By.xpath('//input[@id="consumerNo"]')).sendKeys(billConsumerNumber);

            // It appears there's a CAPTCHA. This part of the code is commented out, but it seems it would have originally clicked a refresh button for the CAPTCHA.
            // await driver.findElement(By.xpath('//button[@id="btnCaptchaRefViewpaybill"]')).click();
            await driver.sleep(2000);

            // Get cookies from the browser session
            let webCookies: IWebDriverCookie[] = await driver.manage().getCookies();
            let cookies: string[] = webCookies.map((cookie) => `${cookie.name}=${cookie.value};`);
            let cookie = cookies.join(' ');
            await driver.sleep(2000);

            // This fetch request seems to be getting the CAPTCHA value
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

            // Enter the CAPTCHA
            await driver.findElement(By.xpath('//input[@id="txtInput"]')).sendKeys(body as string);

            // Click the submit button
            await driver.findElement(By.xpath('//button[@id="submitButton"]')).click();

            // Get the bill amount
            let amount = await driver
                .findElement(
                    By.xpath(electricityParam.MAHARASHTRA_STATE_ELECTRICITY_DISTRIBUTION_CO_LTD.bill_amount_xpath)
                )
                .getText();
            await driver.sleep(2000);

            // Get the due date
            let date = await driver
                .findElement(
                    By.xpath(electricityParam.MAHARASHTRA_STATE_ELECTRICITY_DISTRIBUTION_CO_LTD.due_date_xpath)
                )
                .getText();
            await driver.sleep(2000);

            // Return the bill amount and due date
            return {
                billAmount: Number.parseFloat(amount),
                billDueDate: new Date(date)
            };
        } catch (e) {
            logger.error('Error while fetching electricity bill for consumer', billConsumerNumber);
            logger.error(e);
        } finally {
            // Quit the driver
            await driver.quit();
        }
    }
}
