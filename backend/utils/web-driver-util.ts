import { Builder } from 'selenium-webdriver';
import { Options as FireFoxOptions } from 'selenium-webdriver/firefox.js';
import { Options } from 'selenium-webdriver/chrome.js';

export const getChromeWebDriver = (downloadDirectory: string | undefined = undefined, headless: boolean = true) => {
    let driverBuilder = new Builder().forBrowser('chrome');
    driverBuilder.setChromeOptions(
        new Options().windowSize({
            width: 1200,
            height: 1100
        })
    );
    if (downloadDirectory) {
        driverBuilder.getChromeOptions().setUserPreferences({ 'download.default_directory': downloadDirectory });
    }
    if (headless) {
        driverBuilder.getChromeOptions().headless();
    }
    return driverBuilder.build();
};

export const getFirefoxWebDriver = (downloadDirectory: string, headless: boolean = true) => {
    let driverBuilder = new Builder().forBrowser('firefox');
    driverBuilder.setFirefoxOptions(
        new FireFoxOptions().setPreference('browser.download.dir', downloadDirectory).windowSize({
            width: 1200,
            height: 1100
        })
    );
    if (headless) {
        driverBuilder.getFirefoxOptions().headless();
    }
    return driverBuilder.build();
};
