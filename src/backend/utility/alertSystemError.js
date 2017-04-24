import httpRequest from 'request-promise';

import { systemReference, administrator } from '../config/server.js';
import { logger } from './logger.js';
import { botApiUrl, getBotToken } from './telegram.js';
import { currentDatetimeString } from './timeUtility.js';


// telegram messaging utility
export function alertSystemError(functionRef, message) {
    httpRequest({ // broadcast alert heading
        method: 'post',
        uri: botApiUrl + getBotToken('upgiITBot') + '/sendMessage',
        body: {
            chat_id: administrator,
            text: `error encountered while executing [${systemReference}][${functionRef}] @ ${currentDatetimeString()}`,
            token: getBotToken('upgiITBot')
        },
        json: true
    }).then((response) => {
        return httpRequest({ // broadcast alert body message
            method: 'post',
            uri: botApiUrl + getBotToken('upgiITBot') + '/sendMessage',
            form: {
                chat_id: administrator,
                text: `error message: ${message}`,
                token: getBotToken('upgiITBot')
            }
        });
    }).then((response) => {
        return logger.info(`${systemReference} alert sent`);
    }).catch((error) => {
        return logger.error(`${systemReference} failure: ${error}`);
    });
}
