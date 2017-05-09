import bodyParser from 'body-parser';
import express from 'express';

import { endpointErrorHandler } from '../../utilities/endpointErrorHandler.js';
import tokenValidation from '../../middlewares/tokenValidation.js';

import { Combined } from '../../models/clients.js';

const router = express.Router();
router.use(bodyParser.json());

router.route('/data/clients')
    .all(tokenValidation)
    .get((request, response, next) => {
        Combined
            .query()
            .then((resultset) => {
                response.status(200).json(resultset);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `客戶資料發生錯誤: ${error}`)
                );
            });
    });

module.exports = router;
