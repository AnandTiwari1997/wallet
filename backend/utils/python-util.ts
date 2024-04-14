import { exec, execSync } from 'child_process';
import { rootDirectoryPath } from '../config.js';
import path from 'path';
import { Logger } from '../core/logger.js';
import fs from 'fs';

const logger: Logger = new Logger('PythonUtil');

export class PythonUtil {
    static pythonRootDirectoryCommand = `cd ${path.resolve(rootDirectoryPath, 'python')}`;
    static pythonActivateVenvCommand = `source venv/bin/activate`;

    static installDependencies() {
        let installCommand = 'python3 -m pip install -r requirements.txt';
        let command = [
            PythonUtil.pythonRootDirectoryCommand,
            PythonUtil.pythonActivateVenvCommand,
            installCommand
        ].join(' && ');
        exec(command, (error, stdout, stderr) => {});
    }

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
