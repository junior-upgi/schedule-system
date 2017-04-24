import express from 'express';

import { endpointErrorHandler } from '../../utility/endpointErrorHandler.js';
import { mssqlConfig } from '../../config/mssqlServer.js';
import tokenValidation from '../../middleware/tokenValidation.js';

const router = express.Router();

router.route('/data/initialization/referenceList')
    .all(tokenValidation)
    .get((request, response, next) => {
        let referenceList = {
            productType: null,
            processType: null,
            privilege: null,
            stage: null,
            state: null
        };
        let knex = require('knex')(mssqlConfig);
        knex('scheduleSystem.dbo.productType').select('*').debug(false)
            .then((resultset) => {
                referenceList.productType = resultset;
                return knex('scheduleSystem.dbo.processType').select('*').debug(false);
            }).then((resultset) => {
                referenceList.processType = resultset;
                return knex('scheduleSystem.dbo.privilege').select('*').debug(false);
            }).then((resultset) => {
                referenceList.privilege = resultset;
                return knex('scheduleSystem.dbo.stage').select('*').debug(false);
            }).then((resultset) => {
                referenceList.stage = resultset;
                return knex('scheduleSystem.dbo.state').select('*').debug(false);
            }).then((resultset) => {
                referenceList.state = resultset;
                return response.status(200).json(referenceList);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `對應資料列表讀取失敗: ${error}`)
                );
            }).finally(() => {
                knex.destroy();
            });
    });

module.exports = router;
