import jwt from 'jsonwebtoken';

import { passphrase } from '../config/server.js';
import { endpointErrorHandler } from '../utility/endpointErrorHandler.js';
import { logger } from '../utility/logger.js';
import { enforceTokenValidation } from '../config/server.js';

// middleware func declaration for token validation
module.exports = (request, response, next) => {
    if (enforceTokenValidation === false) {
        logger.info('skip token validation...');
        next();
    } else {
        // get the full request route
        const requestRoute = `${request.protocol}://${request.get('Host')}${request.originalUrl}`;
        logger.info(`conducting token validation on ${requestRoute}`);
        // check request for token
        const accessToken =
            (request.body && request.body.accessToken) ||
            (request.query && request.query.accessToken) ||
            request.headers['x-access-token'];
        if (accessToken) { // if a token is found
            jwt.verify(accessToken, passphrase(), (error, decodedToken) => {
                if (error) {
                    return response.status(403).json(
                        endpointErrorHandler(request.method, request.originalUrl, `帳號使用權限發生錯誤: ${error.message}`)
                    );
                }
                logger.info('credential is valid...');
                next();
            });
        } else { // if there is no token, return an error
            return response.status(403).json(
                endpointErrorHandler(request.method, request.originalUrl, '認證遺失，請重新登入')
            );
        }
    }
};
