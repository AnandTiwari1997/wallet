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
    static maxModuleNameLength: number;
    forName: string;

    constructor(forName: string) {
        this.forName = forName;
        LoggerPadLength.maxModuleNameLength = Math.max(forName.length, LoggerPadLength.maxModuleNameLength);
    }

    info = (...message: any[]) => {
        if (Logger.level === LoggerLevel.DEBUG || Logger.level === LoggerLevel.INFO) {
            console.info(`\u001b[37m [${new Date().toISOString()} - INFO ] [${this.forName.padStart(LoggerPadLength.maxModuleNameLength)}]`, ' - ', message);
        }
    };

    debug = (...message: any[]) => {
        if (Logger.level === LoggerLevel.DEBUG) {
            console.debug(`\u001b[33m [${new Date().toISOString()} - DEBUG] [${this.forName.padStart(LoggerPadLength.maxModuleNameLength)}]`, ' - ', message);
        }
    };

    error = (...message: any[]) => {
        console.error(`\u001b[31m [${new Date().toISOString()} - ERROR] [${this.forName.padStart(LoggerPadLength.maxModuleNameLength)}]`, ' - ', message);
    };
}
