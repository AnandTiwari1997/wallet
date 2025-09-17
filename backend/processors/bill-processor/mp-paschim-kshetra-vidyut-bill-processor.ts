import { By, WebDriver } from 'selenium-webdriver';
import { Logger } from '../../core/logger.js';
import { electricityParam } from '../../config.js';

// Create a new logger instance for this processor
const logger: Logger = new Logger('MPWestZoneElectricityDistributionBillProcessor');

// Export the main class for processing MP West Zone electricity bills
export class MPWestZoneElectricityDistributionBillProcessor {
    /**
     * Processes the electricity bill for a given consumer number.
     * @param billConsumerNumber The consumer number for the bill to be processed.
     * @param driver The WebDriver instance to use for browsing.
     * @returns A promise that resolves with the bill amount and due date, or undefined if an error occurs.
     */
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
            // Navigate to the MPWZ services website
            await driver.get('https://mpwzservices.mpwin.co.in/westdiscom/home');
            logger.info(`Opened https://mpwzservices.mpwin.co.in/westdiscom/home`);
            // Wait for the page to load
            await driver.sleep(2000);
            // Find the input field for the IVRS number and enter the consumer number
            await driver
                .findElement(By.xpath('//*[@id="home"]/div[2]/div/form/div[2]/input'))
                .sendKeys(billConsumerNumber);
            logger.info(`IVRS Number Entered`);
            // Click the submit button
            await driver.findElement(By.xpath('//input[@type="submit"]')).click();
            logger.info(`Clicked Proceed`);
            // Wait for the bill details to load
            await driver.sleep(4000);
            // Get the bill amount from the page
            let amount = await driver
                .findElement(By.xpath(electricityParam.M_P_PASHCHIM_KSHETRA_VIDYUT_VITARAN_CO_LTD.bill_amount_xpath))
                .getText();
            // Wait for a moment
            await driver.sleep(2000);
            // Get the due date from the page
            let date = await driver
                .findElement(By.xpath(electricityParam.M_P_PASHCHIM_KSHETRA_VIDYUT_VITARAN_CO_LTD.due_date_xpath))
                .getText();
            // Wait for a moment
            await driver.sleep(2000);
            // Return the bill amount and due date
            return {
                billAmount: Number.parseFloat(amount),
                billDueDate: new Date(date)
            };
        } catch (e) {
            // Log any errors that occur
            logger.error('Error while fetching electricity bill for consumer', billConsumerNumber);
        } finally {
            // Quit the driver
            await driver.quit();
        }
    }
}
