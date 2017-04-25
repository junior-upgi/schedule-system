import express from 'express';

import { endpointErrorHandler } from '../../utility/endpointErrorHandler.js';
import { mssqlConfig } from '../../config/mssqlServer.js';
import tokenValidation from '../../middleware/tokenValidation.js';

const router = express.Router();

router.route('/data/jobType')
    .all(tokenValidation)
    .get((request, response, next) => {
        let knex = require('knex')(mssqlConfig);
        knex('scheduleSystem.dbo.jobType').select('*').orderBy('displaySequence').debug(false)
            .then((resultset) => {
                return response.status(200).json({ jobType: resultset });
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `工作類別資料表讀取發生錯誤: ${error}`)
                );
            }).finally(() => {
                knex.destroy();
            });
    });

module.exports = router;
