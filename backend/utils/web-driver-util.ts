import { Builder } from 'selenium-webdriver';
import { Options as FireFoxOptions } from 'selenium-webdriver/firefox.js';
import { Options } from 'selenium-webdriver/chrome.js';

const DEFAULT_WINDOW_SIZE = { width: 1200, height: 1100 };

/**
 * Creates a new Chrome WebDriver instance.
 * @param {string | undefined} downloadDirectory The directory to download files to.
 * @param {boolean} headless Whether to run Chrome in headless mode.
 * @returns {WebDriver} A new Chrome WebDriver instance.
 */
export const getChromeWebDriver = (downloadDirectory: string | undefined = undefined, headless: boolean = true) => {
    let driverBuilder = new Builder().forBrowser('chrome');
    driverBuilder.setChromeOptions(new Options().windowSize(DEFAULT_WINDOW_SIZE));
    if (downloadDirectory) {
        driverBuilder.getChromeOptions().setUserPreferences({ 'download.default_directory': downloadDirectory });
    }
    if (headless) {
        driverBuilder.getChromeOptions().headless();
    }
    return driverBuilder.build();
};

/**
 * Creates a new Firefox WebDriver instance.
 * @param {string} downloadDirectory The directory to download files to.
 * @param {boolean} headless Whether to run Firefox in headless mode.
 * @returns {WebDriver} A new Firefox WebDriver instance.
 */
export const getFirefoxWebDriver = (downloadDirectory: string | undefined = undefined, headless: boolean = true) => {
    let driverBuilder = new Builder().forBrowser('firefox');
    driverBuilder.setFirefoxOptions(new FireFoxOptions().windowSize(DEFAULT_WINDOW_SIZE));
    if (downloadDirectory) {
        driverBuilder.getFirefoxOptions().setPreference('browser.download.dir', downloadDirectory);
    }
    if (headless) {
        driverBuilder.getFirefoxOptions().headless();
    }
    return driverBuilder.build();
};
