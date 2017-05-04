import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import exphbs from 'express-handlebars';
import morgan from 'morgan';
import path from 'path';

import { port, serverUrl, systemReference } from './config/server.js';
import { logger } from './utilities/logger.js';
import { statusReport } from './utilities/statusReport.js';
import { sequelize } from './config/database.js';

const app = express();
const main = express.Router();
app.use(`/${systemReference}`, main);
main.use(cors());
main.use(morgan('dev'));
main.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
main.use(bodyParser.json()); // parse application/json
main.use('/', express.static(path.join(__dirname, '/../public'))); // frontend client server route
main.use('/bower_components', express.static(path.join(__dirname, '/../bower_components'))); // serve bower packages

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

// data routes
main.use('/', require('./routes/data/smartsheet/workspaces.js'));
main.use('/', require('./routes/data/initialize.js'));
main.use('/', require('./routes/data/referenceTables.js'));
// utility routes
main.use('/', require('./routes/utility/login.js'));
main.use('/', require('./routes/utility/status.js'));

// initiate server script
sequelize
    .authenticate()
    .then(() => {
        if (!module.parent) {
            app.listen(port, (error) => { // start backend server
                if (error) {
                    logger.error(`error starting ${systemReference} server: ${error}`);
                } else {
                    logger.info(`${systemReference} server in operation... (${serverUrl})`);
                    statusReport.start(); // start the server status reporting function
                }
            });
        }
    })
    .catch((error) => {
        logger.error(`error starting ${systemReference} server: database connection cannot be established - ${error}`);
    });
