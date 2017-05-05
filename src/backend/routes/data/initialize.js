import express from 'express';

import { endpointErrorHandler } from '../../utilities/endpointErrorHandler.js';
import { dbConfig } from '../../config/database.js';
import tokenValidation from '../../middlewares/tokenValidation.js';

import { sequelize } from '../../config/database.js';
import { JobTemplates } from '../../models/jobTemplates.js';
import { JobTypes } from '../../models/jobTypes.js';
import { Phases } from '../../models/phases.js';
import { ProcessStates } from '../../models/processStates.js';
import { ProcessTypes } from '../../models/processTypes.js';
import { ProductTypes } from '../../models/productTypes.js';

const router = express.Router();

router.route('/data/test')
    .all(tokenValidation)
    .get((request, response, next) => {
        let initData = {
            jobTemplates: null,
            jobTypes: null,
            phases: null,
            processStates: null,
            processTypes: null,
            productTypes: null
        };
        return sequelize.transaction((t) => {
            return JobTemplates.findAll({
                where: { active: true }
            }, {
                transaction: t
            }).then((resultset) => {
                initData.jobTemplates = resultset;
                return JobTypes.findAll({
                    where: { active: true }
                }, {
                    transaction: t
                });
            }).then((resultset) => {
                initData.jobTypes = resultset;
                return Phases.findAll({
                    where: { active: true }
                }, {
                    transaction: t
                });
            }).then((resultset) => {
                initData.phases = resultset;
                return ProcessStates.findAll({
                    where: { active: true }
                }, {
                    transaction: t
                });
            }).then((resultset) => {
                initData.processStates = resultset;
                return ProcessTypes.findAll({
                    where: { active: true }
                }, {
                    transaction: t
                });
            }).then((resultset) => {
                initData.processTypes = resultset;
                return ProductTypes.findAll({
                    where: { active: true }
                }, {
                    transaction: t
                });
            });
        }).then((resultset) => {
            initData.productTypes = resultset;
            return response.status(200).json(initData);
        }).catch((error) => {
            return response.status(500).json(
                endpointErrorHandler(
                    request.method,
                    request.originalUrl,
                    `系統初始化資料讀取失敗: ${error}`
                )
            );
        });
    });

router.route('/data/initialize')
    .all(tokenValidation)
    .get((request, response, next) => {
        let initData = {
            jobTemplates: null,
            jobTypes: null,
            phases: null,
            processStates: null,
            processTypes: null,
            productTypes: null
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
