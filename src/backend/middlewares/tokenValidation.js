import jwt from 'jsonwebtoken';

import { passphrase, enforceTokenValidation, ddnsHost, port } from '../config/server.js';
import { logger } from '../utilities/logger.js';

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
                    response.status(403);
                    next(`${response.statusCode} Forbidden (Unauthorized Token)`);
                }
                logger.info('credential is valid...');
                next();
            });
        } else { // if there is no token, return an error
            response.status(403);
            next(`${response.statusCode} Forbidden (Lost Token)`);
        }
    }
};
