import express from 'express';

import { endpointErrorHandler } from '../../utilities/endpointErrorHandler.js';
import { dbConfig } from '../../config/database.js';
import tokenValidation from '../../middlewares/tokenValidation.js';

const router = express.Router();

router.route('/data/initialize')
    .all(tokenValidation)
    .get((request, response, next) => {
        let initData = {
            jobTypes: null,
            processStates: null,
            processTemplates: null,
            processTypes: null,
            productTypes: null,
            phases: null
        };
        let knex = require('knex')(dbConfig);
        knex.transaction((trx) => {
            return trx('scheduleSystem.dbo.jobTypes')
                .select('*')
                .where({ active: 1 })
                .orderBy('displaySequence')
                .then((resultset) => {
                    initData.jobTypes = resultset;
                    return trx('scheduleSystem.dbo.processStates')
                        .select('*')
                        .where({ active: 1 })
                        .orderBy('displaySequence');
                }).then((resultset) => {
                    initData.processStates = resultset;
                    return trx('scheduleSystem.dbo.processTemplates')
                        .select('*')
                        .whereNull('deprecated')
                        .orderBy('active', 'desc')
                        .orderBy('displaySequence')
                        .orderBy('reference');
                }).then((resultset) => {
                    initData.processTemplates = resultset;
                    return trx('scheduleSystem.dbo.processTypes')
                        .select('*')
                        .where({ active: 1 })
                        .orderBy('displaySequence');
                }).then((resultset) => {
                    initData.processTypes = resultset;
                    return trx('scheduleSystem.dbo.productTypes')
                        .select('*')
                        .where({ active: 1 })
                        .orderBy('displaySequence');
                }).then((resultset) => {
                    initData.productTypes = resultset;
                    return trx('scheduleSystem.dbo.phases')
                        .select('*')
                        .where({ active: 1 })
                        .orderBy('displaySequence');
                });
        }).then((resultset) => {
            initData.phases = resultset;
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