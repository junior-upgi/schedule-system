import { alertSystemError } from './alertSystemError.js';
import { logger } from './logger.js';

export function endpointErrorHandler(method, originalUrl, errorMessage) {
    const errorString = `${method} ${originalUrl} route failure: ${errorMessage}`;
    logger.error(errorString);
    logger.info(alertSystemError(`${method} ${originalUrl} route`, errorString));
    return {
        errorMessage: errorString
    };
}
