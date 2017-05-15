import { ddnsHost, port } from '../config/server.js';

// middleware functions to deal with successfully executed reqeusts
module.exports = (request, response, next) => {
    const responseObject = {
        method: request.method,
        endpoint: `${request.protocol}://${ddnsHost}:${port}${request.originalUrl}`,
        success: true,
        statusCode: response.statusCode,
        data: response.customData,
        messsage: response.customMessage
    };
    let cannedMessage = null;
    switch (response.statusCode) {
        case 200:
            cannedMessage = `${response.statusCode} OK`;
            setResponseMessage(responseObject, cannedMessage);
            return response.json(responseObject).end();
        case 201:
            cannedMessage = `${response.statusCode} Created`;
            setResponseMessage(responseObject, cannedMessage);
            return response.json(responseObject).end();
        case 202:
            cannedMessage = `${response.statusCode} Accepted`;
            setResponseMessage(responseObject, cannedMessage);
            return response.json(responseObject).end();
        case 204:
            cannedMessage = `${response.statusCode} No Content`;
            setResponseMessage(responseObject, cannedMessage);
            return response.json(responseObject).end();
        default:
            next();
    }
};

function setResponseMessage(messageObject, cannedMessage) {
    if ((messageObject.message === undefined) || (messageObject.message === null)) {
        messageObject.message = cannedMessage;
    }
}
