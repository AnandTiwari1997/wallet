/**
 * @file Logger
 * @author anand
 */

/**
 * Enum for logger levels
 * @enum {string}
 */
export class LoggerLevel {
    static INFO: string = 'INFO';
    static DEBUG: string = 'DEBUG';
    static ERROR: string = 'ERROR';
    static WARN: string = 'WARN';
}

/**
 * Class to hold padding length for module name in logs
 */
export class LoggerPadLength {
    static maxModuleNameLength: number = 0;
}

/**
 * Logger class
 */
export class Logger {
    static level: LoggerLevel = LoggerLevel.INFO;
    forName: string;

    /**
     * Creates an instance of Logger.
     * @param {string} forName - The name of the module.
     */
    constructor(forName: string) {
        this.forName = forName;
        LoggerPadLength.maxModuleNameLength = Math.max(forName.length, LoggerPadLength.maxModuleNameLength);
    }

    /**
     * Logs a message at INFO level.
     * @param {...any[]} message - The message to log.
     */
    info = (...message: any[]) => {
        if (Logger.level === LoggerLevel.DEBUG || Logger.level === LoggerLevel.INFO) {
            let original = Error.prepareStackTrace;
            // Override prepareStackTrace to get the function name and line number
            Error.prepareStackTrace = (err, stackTraces) => {
                return `${stackTraces[1].getFunctionName() || '<anonynous>'}:${stackTraces[1].getLineNumber()}`;
            };
            console.info(
                `\u001b[37m [${new Date().toISOString()} - INFO ] [${this.forName.padStart(
                    LoggerPadLength.maxModuleNameLength
                )}] [${(new Error().stack || '').padStart(LoggerPadLength.maxModuleNameLength / 2)}]`,
                ' - ',
                message
            );
            // Restore original prepareStackTrace
            Error.prepareStackTrace = original;
        }
    };

    /**
     * Logs a message at DEBUG level.
     * @param {...any[]} message - The message to log.
     */
    debug = (...message: any[]) => {
        if (Logger.level === LoggerLevel.DEBUG) {
            let original = Error.prepareStackTrace;
            // Override prepareStackTrace to get the function name and line number
            Error.prepareStackTrace = (err, stackTraces) => {
                return `${stackTraces[0].getFunctionName() || '<anonynous>'}:${stackTraces[0].getLineNumber()}`;
            };
            console.debug(
                `\u001b[33m [${new Date().toISOString()} - DEBUG] [${this.forName.padStart(
                    LoggerPadLength.maxModuleNameLength
                )}] [${(new Error().stack || '').padStart(LoggerPadLength.maxModuleNameLength / 2)}]`,
                ' - ',
                message
            );
            // Restore original prepareStackTrace
            Error.prepareStackTrace = original;
        }
    };

    /**
     * Logs a message at ERROR level.
     * @param {...any[]} message - The message to log.
     */
    error = (...message: any[]) => {
        let original = Error.prepareStackTrace;
        // Override prepareStackTrace to get the function name and line number
        Error.prepareStackTrace = (err, stackTraces) => {
            return `${stackTraces[1].getFunctionName() || '<anonynous>'}:${stackTraces[1].getLineNumber()}`;
        };
        let stackDetail = new Error().stack;
        // Restore original prepareStackTrace
        Error.prepareStackTrace = original;
        console.error(
            `\u001b[31m [${new Date().toISOString()} - ERROR] [${this.forName.padStart(
                LoggerPadLength.maxModuleNameLength
            )}] [${(stackDetail || '').padStart(LoggerPadLength.maxModuleNameLength / 2)}]`,
            ' - ',
            message
        );
    };

    /**
     * Logs a message at WARN level.
     * @param {...any[]} message - The message to log.
     */
    warn = (...message: any[]) => {
        let original = Error.prepareStackTrace;
        // Override prepareStackTrace to get the function name and line number
        Error.prepareStackTrace = (err, stackTraces) => {
            return `${stackTraces[1].getFunctionName() || '<anonynous>'}:${stackTraces[1].getLineNumber()}`;
        };
        let stackDetail = new Error().stack;
        // Restore original prepareStackTrace
        Error.prepareStackTrace = original;
        console.warn(
            `\u001b[31m [${new Date().toISOString()} - ERROR] [${this.forName.padStart(
                LoggerPadLength.maxModuleNameLength
            )}] [${(stackDetail || '').padStart(LoggerPadLength.maxModuleNameLength / 2)}]`,
            ' - ',
            message
        );
    };
}
