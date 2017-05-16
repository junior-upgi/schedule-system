import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import exphbs from 'express-handlebars';
import express from 'express';
import morgan from 'morgan';
import path from 'path';

import { port, serverUrl, systemReference } from './config/server.js';
import { logger } from './utilities/logger.js';
import { statusReport } from './utilities/statusReport.js';
import { sequelize } from './config/database.js';

// dotenv enviornmental variable loader template
dotenv.config(); // loads .env file from root of project
// dotenv.config({ path: 'custom-path-to-.env-file' });
logger.info('----------------------------------------');
logger.info('dotenv module test:');
logger.info(`the 'TEST' environment variable is currently: ${process.env.TEST}`);
if ((process.env.TEST === undefined) || (process.env.TEST === 'test')) {
    logger.info('dotenv module is working');
} else {
    logger.error('dotenv module is not working');
}
logger.info('----------------------------------------');

const app = express();
const main = express.Router();
app.use(`/${systemReference}`, main);
main.use(cors());
main.use(morgan('dev'));
main.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
main.use(bodyParser.json()); // parse application/json
main.use('/', express.static(path.join(__dirname, '/../public'))); // frontend client server route
main.use('/bower_components', express.static(path.join(__dirname, '/../bower_components'))); // serve bower packages

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

// Handlebars templating engine test route
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: path.join(__dirname, '/../public/layouts'),
    partialsDir: path.join(__dirname, '/../public/partials')
}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, '/../public'));
app.set('layouts', path.join(__dirname, '/../public/layouts'));
app.set('partials', path.join(__dirname, '/../public/partials'));
const appTitle = require('./config/server.js').appTitle;
main.get('/templateTest', (request, response) => {
    return response.status(200).render('templateTest', {
        title: appTitle
    });
});

// reference routes
// main.use('/', require('./routes/reference/common.js')); // common reference tables

// data routes
// main.use('/', require('./routes/data/smartsheet/workspaces.js'));
// main.use('/', require('./routes/data/initialize.js'));
// main.use('/', require('./routes/data/referenceTables.js'));
// main.use('/', require('./routes/data/clients.js'));
// main.use('/', require('./routes/data/jobs.js'));

// utility routes
// main.use('/', require('./routes/utility/login.js'));
// main.use('/', require('./routes/utility/status.js'));

// initiate server script
if (!module.parent) {
    // verify database server status
    Promise.all([sequelize.authenticate()])
        .then(() => {
            app.listen(port, (error) => { // start backend server
                if (error) {
                    logger.error(`error starting ${systemReference} server: ${error}`);
                } else {
                    logger.info(`${systemReference} server in operation... (${serverUrl})`);
                    // start other services
                    statusReport.start(); // status reporting
                }
            });
        })
        .catch((error) => {
            logger.error(`database authentication error, ${systemReference} server is NOT started: ${error}`);
        });
}
