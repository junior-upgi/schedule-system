import express from 'express';
import client from 'smartsheet';

// import httpRequest from 'request-promise';
/*
const moment = require('moment-timezone');
const Treeize = require('treeize');
const uuidV4 = require('uuid/v4');
*/

import tokenValidation from '../../../middleware/tokenValidation.js';
import { smartsheetToken } from '../../../config/smartsheet.js';
import { endpointErrorHandler } from '../../../utility/endpointErrorHandler.js';
// import { workspaceIdObj } from '../../../model/smartsheet.js';

const router = express.Router();
const smartsheet = client.createClient({ accessToken: smartsheetToken });

router.route('/data/smartsheet/workspaces')
    .all(tokenValidation)
    .get((request, response, next) => {
        smartsheet.workspaces.getWorkspace(6009773087844228)
            .then((apiResponse) => {
                return response.status(200).json({ workspaces: apiResponse });
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `smartsheet projectControl workspace request failed (${error.errorCode}: ${error.message})`
                    )
                );
            });
    });

module.exports = router;
