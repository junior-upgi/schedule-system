import fs from 'fs';
import winston from 'winston';

import { development } from '../config/server.js';
import { logDir } from '../config/logger.js';
import { currentDatetimeString } from '../utility/timeUtility.js';

// logging utility
// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) { fs.mkdirSync(logDir); }
export const logger = new(winston.Logger)({
    transports: [
        // colorize the output to the console
        new(winston.transports.Console)({
            timestamp: currentDatetimeString(),
            colorize: true,
            level: 'debug'
        }),
        new(winston.transports.File)({
            filename: `${logDir}/results.log`,
            timestamp: currentDatetimeString(),
            level: development ? 'debug' : 'info'
        })
    ]
});
