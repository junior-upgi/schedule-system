import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import exphbs from 'express-handlebars';
import morgan from 'morgan';
import path from 'path';

import { port, serverUrl, systemReference } from './config/server.js';
import { logger } from './utility/logger.js';
import { statusReport } from './utility/statusReport.js';

const app = express();
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
const main = express.Router();
app.use(`/${systemReference}`, main);
main.use(cors());
main.use(morgan('dev'));
main.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
main.use(bodyParser.json()); // parse application/json
main.use('/', express.static(path.join(__dirname, '/../public'))); // frontend client server route
main.use('/bower_components', express.static(path.join(__dirname, '/../bower_components'))); // serve bower packages

// data routes
main.use('/', require('./route/data/smartsheet/workspaces.js'));
main.use('/', require('./route/data/initialize.js'));
main.use('/', require('./route/data/commonReference.js'));
// utility routes
main.use('/', require('./route/utility/login.js'));
main.use('/', require('./route/utility/status.js'));

// initiate server script
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
