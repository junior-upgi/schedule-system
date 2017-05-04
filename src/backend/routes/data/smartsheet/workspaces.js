import express from 'express';
import client from 'smartsheet';

import tokenValidation from '../../../middlewares/tokenValidation.js';
import { smartsheetToken } from '../../../config/smartsheet.js';
import { endpointErrorHandler } from '../../../utilities/endpointErrorHandler.js';

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
