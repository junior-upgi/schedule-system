import cron from 'node-cron';
import moment from 'moment-timezone';
import os from 'os';
import httpRequest from 'request-promise';

import { systemReference, administrator } from '../config/server.js';
import { alertSystemError } from './alertSystemError.js';
import { logger } from './logger.js';
import { botApiUrl, getBotToken } from './telegram.js';

// status report utility
export const statusReport = cron.schedule('0 0 8,22 * * *', () => {
    logger.info(`${systemReference} reporting mechanism triggered`);
    const issuedDatetime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    const message = `${issuedDatetime} ${systemReference} server reporting in from ${os.hostname()}`;
    httpRequest({
        method: 'post',
        uri: botApiUrl + getBotToken('upgiITBot') + '/sendMessage',
        body: {
            chat_id: administrator,
            text: `${message}`,
            token: getBotToken('upgiITBot')
        },
        json: true
    }).then((response) => {
        logger.verbose(`${message}`);
        return logger.info(`${systemReference} reporting mechanism completed`);
    }).catch((error) => {
        alertSystemError('statusReport', error);
        return logger.error(`${systemReference} reporting mechanism failure ${error}`);
    });
}, false);
