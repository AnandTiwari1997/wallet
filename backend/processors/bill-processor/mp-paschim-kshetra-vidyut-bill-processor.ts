import { By, WebDriver } from 'selenium-webdriver';
import { Logger } from '../../core/logger.js';
import { electricityParam } from '../../config.js';

const logger: Logger = new Logger('MPWestZoneElectricityDistributionBillProcessor');

export class MPWestZoneElectricityDistributionBillProcessor {
    async process(
        billConsumerNumber: string,
        driver: WebDriver
    ): Promise<
        | {
              billAmount: number;
              billDueDate: Date;
          }
        | undefined
    > {
        try {
            await driver.get('https://mpwzservices.mpwin.co.in/westdiscom/home');
            logger.info(`Opened https://mpwzservices.mpwin.co.in/westdiscom/home`);
            await driver.sleep(2000);
            await driver
                .findElement(By.xpath('//*[@id="home"]/div[2]/div/form/div[2]/input'))
                .sendKeys(billConsumerNumber);
            logger.info(`IVRS Number Entered`);
            await driver.findElement(By.xpath('//input[@type="submit"]')).click();
            logger.info(`Clicked Proceed`);
            await driver.sleep(4000);
            let amount = await driver
                .findElement(By.xpath(electricityParam.M_P_PASHCHIM_KSHETRA_VIDYUT_VITARAN_CO_LTD.bill_amount_xpath))
                .getText();
            await driver.sleep(2000);
            let date = await driver
                .findElement(By.xpath(electricityParam.M_P_PASHCHIM_KSHETRA_VIDYUT_VITARAN_CO_LTD.due_date_xpath))
                .getText();
            await driver.sleep(2000);
            return {
                billAmount: Number.parseFloat(amount),
                billDueDate: new Date(date)
            };
        } catch (e) {
            logger.error('Error while fetching electricity bill for consumer', billConsumerNumber);
        } finally {
            await driver.quit();
        }
    }
}
