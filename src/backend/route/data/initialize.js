import express from 'express';

import { endpointErrorHandler } from '../../utility/endpointErrorHandler.js';
import { mssqlConfig } from '../../config/mssqlServer.js';
import tokenValidation from '../../middleware/tokenValidation.js';

const router = express.Router();

router.route('/data/initialize')
    .all(tokenValidation)
    .get((request, response, next) => {
        let initData = {
            jobType: null,
            processState: null,
            processTemplate: null,
            processType: null,
            productType: null,
            phase: null
        };
        let knex = require('knex')(mssqlConfig);
        knex.transaction((trx) => {
            return trx('scheduleSystem.dbo.jobType')
                .select('*')
                .where({ active: 1 })
                .orderBy('displaySequence')
                .then((resultset) => {
                    initData.jobType = resultset;
                    return trx('scheduleSystem.dbo.processState')
                        .select('*')
                        .where({ active: 1 })
                        .orderBy('displaySequence');
                }).then((resultset) => {
                    initData.processState = resultset;
                    return trx('scheduleSystem.dbo.processTemplate')
                        .select('*')
                        .whereNull('deprecated')
                        .orderBy('active', 'desc')
                        .orderBy('displaySequence')
                        .orderBy('reference');
                }).then((resultset) => {
                    initData.processTemplate = resultset;
                    return trx('scheduleSystem.dbo.processType')
                        .select('*')
                        .where({ active: 1 })
                        .orderBy('displaySequence');
                }).then((resultset) => {
                    initData.processType = resultset;
                    return trx('scheduleSystem.dbo.productType')
                        .select('*')
                        .where({ active: 1 })
                        .orderBy('displaySequence');
                }).then((resultset) => {
                    initData.productType = resultset;
                    return trx('scheduleSystem.dbo.phase')
                        .select('*')
                        .where({ active: 1 })
                        .orderBy('displaySequence');
                });
        }).then((resultset) => {
            initData.phase = resultset;
            return response.status(200).json(initData);
        }).catch((error) => {
            return response.status(500).json(
                endpointErrorHandler(
                    request.method,
                    request.originalUrl,
                    `系統初始化資料讀取失敗: ${error}`
                )
            );
        }).finally(() => {
            knex.destroy();
        });
    });

module.exports = router;
