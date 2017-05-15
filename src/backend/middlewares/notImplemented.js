import { ddnsHost, port } from '../config/server.js';

module.exports = (request, response, next) => {
    response.status(501);
    next(`${request.protocol}://${ddnsHost}:${port}${request.originalUrl} has not been implemented`);
};
