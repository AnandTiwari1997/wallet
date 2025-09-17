/**
 * @file python-util.ts
 * @description This file contains the PythonUtil class which is used to run python scripts.
 */
import { exec, execSync } from 'child_process';
import { rootDirectoryPath } from '../config.js';
import path from 'path';
import { Logger } from '../core/logger.js';
import fs from 'fs';

const logger: Logger = new Logger('PythonUtil');

/**
 * @class PythonUtil
 * @description A utility class for running python scripts.
 */
export class PythonUtil {
    // Command to change directory to the python root directory.
    static pythonRootDirectoryCommand = `cd ${path.resolve(rootDirectoryPath, 'python')}`;
    // Command to activate the python virtual environment.
    static pythonActivateVenvCommand = `source venv/bin/activate`;

    /**
     * @method installDependencies
     * @description Installs python dependencies from requirements.txt.
     */
    static installDependencies() {
        let installCommand = 'python3 -m pip install -r requirements.txt';
        let command = [
            PythonUtil.pythonRootDirectoryCommand,
            PythonUtil.pythonActivateVenvCommand,
            installCommand
        ].join(' && ');
        exec(command, (error, stdout, stderr) => {});
    }

    /**
     * @method buildScriptRunCommand
     * @description Builds the command to run the python script.
     * @param args - The arguments to pass to the python script.
     * @returns The command to run the python script.
     */
    static buildScriptRunCommand(args: string[]) {
        return [
            'python3',
            'main.py',
            args[0],
            path.resolve(rootDirectoryPath, 'reports', args[0], args[1]),
            path.resolve(rootDirectoryPath, 'reports', args[0], args[2]),
            args[3]
        ].join(' ');
    }

    /**
     * @method run
     * @description Runs a python script asynchronously.
     * @param args - The arguments to pass to the python script.
     * @param success - The success callback.
     * @param error - The error callback.
     */
    static run(args: string[], success: (data: any) => void, error: (data: any) => void) {
        let runPythonScriptCommand = PythonUtil.buildScriptRunCommand(args);
        let command = [
            PythonUtil.pythonRootDirectoryCommand,
            PythonUtil.pythonActivateVenvCommand,
            runPythonScriptCommand
        ].join(' && ');
        exec(command, (err, stdout, stderr) => {
            if (stdout) {
                try {
                    const data = fs.readFileSync(path.resolve(rootDirectoryPath, 'reports', args[0], args[2]), {
                        encoding: 'utf8'
                    });
                    success(data);
                } catch (e) {
                    logger.error(e);
                }
            }
        });
    }

    /**
     * @method runSync
     * @description Runs a python script synchronously.
     * @param args - The arguments to pass to the python script.
     * @returns The result of the python script.
     */
    static runSync(args: string[]) {
        let runPythonScriptCommand = PythonUtil.buildScriptRunCommand(args);
        let command = [
            PythonUtil.pythonRootDirectoryCommand,
            PythonUtil.pythonActivateVenvCommand,
            runPythonScriptCommand
        ].join(' && ');
        let data = execSync(command, {
            encoding: 'utf-8'
        });
        if (data) {
            return fs.readFileSync(path.resolve(rootDirectoryPath, 'reports', args[0], args[2]), {
                encoding: 'utf8'
            });
        }
    }
}
