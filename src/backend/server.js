import express from 'express';

import { systemReference } from './config/system.js';

const app = express();
app.use(`/${systemReference}`, main);
const main = express.Router();

// default error handlers
if (app.get('env') === 'development') {
    app.use((error, request, response, next) => {
        // logger.error('DEFAULT DEVELOPMENT ERROR HANDLER MIDDLEWARE TRIGGERED');
        response.status(error.status || 500);
        response.json({
            message: error.message,
            error: error
        });
    });
}
if (app.get('env') === 'production') {
    app.use((error, request, response, next) => {
        // logger.error('DEFAULT PRODUCTION ERROR HANDLER MIDDLEWARE TRIGGERED');
        response.status(error.status || 500);
        response.json({
            message: error.message,
            error: {}
        });
    });
}
