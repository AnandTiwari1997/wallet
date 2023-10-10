export class LoggerLevel {
    static INFO: string = 'INFO';
    static DEBUG: string = 'DEBUG';
    static ERROR: string = 'ERROR';
    static WARN: string = 'WARN';
}

export class Logger {
    static level: LoggerLevel = LoggerLevel.INFO;
    forName: string;

    constructor(forName: string) {
        this.forName = forName;
        console.debug();
    }

    info = (...message: any[]) => {
        if (Logger.level === LoggerLevel.DEBUG || Logger.level === LoggerLevel.INFO) {
            console.info(`[${new Date().toISOString()} - INFO] [${this.forName}]`, ' - ', message);
        }
    };

    debug = (...message: any[]) => {
        if (Logger.level === LoggerLevel.DEBUG) {
            console.debug(`[${new Date().toISOString()} - DEBUG] [${this.forName}]`, ' - ', message);
        }
    };

    error = (...message: any[]) => {
        console.error(`[${new Date().toISOString()} - ERROR] [${this.forName}]`, ' - ', message);
    };
}
