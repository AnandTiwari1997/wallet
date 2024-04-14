export class LoggerLevel {
    static INFO: string = 'INFO';
    static DEBUG: string = 'DEBUG';
    static ERROR: string = 'ERROR';
    static WARN: string = 'WARN';
}

export class LoggerPadLength {
    static maxModuleNameLength: number = 0;
}

export class Logger {
    static level: LoggerLevel = LoggerLevel.INFO;
    forName: string;

    constructor(forName: string) {
        this.forName = forName;
        LoggerPadLength.maxModuleNameLength = Math.max(forName.length, LoggerPadLength.maxModuleNameLength);
    }

    info = (...message: any[]) => {
        if (Logger.level === LoggerLevel.DEBUG || Logger.level === LoggerLevel.INFO) {
            let original = Error.prepareStackTrace;
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
            Error.prepareStackTrace = original;
        }
    };

    debug = (...message: any[]) => {
        if (Logger.level === LoggerLevel.DEBUG) {
            let original = Error.prepareStackTrace;
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
            Error.prepareStackTrace = original;
        }
    };

    error = (...message: any[]) => {
        let original = Error.prepareStackTrace;
        Error.prepareStackTrace = (err, stackTraces) => {
            return `${stackTraces[1].getFunctionName() || '<anonynous>'}:${stackTraces[1].getLineNumber()}`;
        };
        let stackDetail = new Error().stack;
        Error.prepareStackTrace = original;
        console.error(
            `\u001b[31m [${new Date().toISOString()} - ERROR] [${this.forName.padStart(
                LoggerPadLength.maxModuleNameLength
            )}] [${(stackDetail || '').padStart(LoggerPadLength.maxModuleNameLength / 2)}]`,
            ' - ',
            message
        );
    };
}
