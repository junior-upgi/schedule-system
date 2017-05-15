import { ddnsHost, port } from '../config/server.js';

// middleware functions to deal with failed requests
module.exports = (error, request, response, next) => {
    let responseObject = {
        method: request.method,
        endpoint: `${request.protocol}://${ddnsHost}:${port}${request.originalUrl}`,
        success: false,
        status: response.statusCode,
        data: response.customData,
        messsage: response.customMessage || error
    };
    let cannedMessage = null;
    let defaultData = null;
    switch (response.statusCode) {
        case 400:
            cannedMessage = `${response.statusCode} Bad Request`;
            setResponseMessage(responseObject, cannedMessage, defaultData);
            return response.status(response.statusCode).json(responseObject);
        case 401:
            cannedMessage = `${response.statusCode} Unauthorized`;
            setResponseMessage(responseObject, cannedMessage, defaultData);
            return response.status(response.statusCode).json(responseObject);
        case 403:
            cannedMessage = `${response.statusCode} Forbidden`;
            setResponseMessage(responseObject, cannedMessage, defaultData);
            return response.status(response.statusCode).json(responseObject);
        case 404:
            cannedMessage = `${response.statusCode} Not Found`;
            setResponseMessage(responseObject, cannedMessage, defaultData);
            return response.status(response.statusCode).json(responseObject);
        case 405:
            cannedMessage = `${response.statusCode} Method Not Allowed`;
            setResponseMessage(responseObject, cannedMessage, defaultData);
            return response.status(response.statusCode).json(responseObject);
        case 500:
            cannedMessage = `${response.statusCode} Internal Server Error`;
            setResponseMessage(responseObject, cannedMessage, defaultData);
            return response.status(response.statusCode).json(responseObject);
        case 503:
            cannedMessage = `${response.statusCode} Service Unavailable`;
            setResponseMessage(responseObject, cannedMessage, defaultData);
            return response.status(response.statusCode).json(responseObject);
        case 501:
        default:
            cannedMessage = `${response.statusCode} Not Implemented`;
            setResponseMessage(responseObject, cannedMessage, defaultData);
            return response.status(501).json(responseObject);
    }
};

function setResponseMessage(responseObject, cannedMessage, defaultData) {
    if ((responseObject.message === undefined) || (responseObject.message === null)) {
        responseObject.message = cannedMessage;
    }
    if ((responseObject.data === undefined) || (responseObject.data === null)) {
        responseObject.data = defaultData;
    }
}
