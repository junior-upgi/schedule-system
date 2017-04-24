import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import path from 'path';

import { port, serverUrl, systemReference } from './config/server.js';
import { logger } from './utility/logger.js';
import { statusReport } from './utility/statusReport.js';

const app = express();
const main = express.Router();
main.user(cors());
main.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
main.use(bodyParser.json()); // parse application/json

main.use('/', express.static(path.join(__dirname, '/../public'))); // frontend client server route
main.use('/bower_components', express.static(path.join(__dirname, '/../bower_components'))); // serve bower packages

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
