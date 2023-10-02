import { Builder } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome.js';
import { Options as FireFoxOptions } from 'selenium-webdriver/firefox.js';

export const getChromeWebDriver = (downloadDirectory: string, headless: boolean = true) => {
    let driverBuilder = new Builder().forBrowser('chrome');
    driverBuilder.setChromeOptions(
        new ChromeOptions()
            .setUserPreferences({ 'download.default_directory': downloadDirectory })
            .windowSize({ width: 1200, height: 1100 })
    );
    if (headless) {
        driverBuilder.getChromeOptions().headless();
    }
    return driverBuilder.build();
};

export const getFirefoxWebDriver = (downloadDirectory: string, headless: boolean = true) => {
    let driverBuilder = new Builder().forBrowser('firefox');
    driverBuilder.setFirefoxOptions(
        new FireFoxOptions()
            .setPreference('browser.download.dir', downloadDirectory)
            .windowSize({ width: 1200, height: 1100 })
    );
    if (headless) {
        driverBuilder.getFirefoxOptions().headless();
    }
    return driverBuilder.build();
};
