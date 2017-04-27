import bodyParser from 'body-parser';
import express from 'express';
import uuidV4 from 'uuid/v4';

import { endpointErrorHandler } from '../../utility/endpointErrorHandler.js';
import { mssqlConfig } from '../../config/mssqlServer.js';
import { currentDatetimeString } from '../../utility/timeUtility.js';
import tokenValidation from '../../middleware/tokenValidation.js';

const router = express.Router();
router.use(bodyParser.json());

router.route('/data/procTemplates/:id')
    .all(tokenValidation)
    .get((request, response, next) => {
        let targetProcTemplateId = request.params.targetProcTemplateId;
        let knex = require('knex')(mssqlConfig);
        knex('scheduleSystem.dbo.procTemplate').select('*').where({ id: targetProcTemplateId }).debug(false)
            .then((resultset) => {
                return response.status(200).json(resultset[0]);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `工序範本資料 [${targetProcTemplateId}] 讀取發生錯誤: ${error}`)
                );
            }).finally(() => {
                knex.destroy();
            });
    })
    .put((request, response, next) => {
        let targetProcTemplateId = request.params.targetProcTemplateId;
        let knex = require('knex')(mssqlConfig);
        knex('scheduleSystem.dbo.procTemplate').update({
                reference: request.body.reference,
                displaySequence: request.body.displaySequence,
                deprecated: request.body.deprecated
            }).where({ id: targetProcTemplateId }).debug(false)
            .then(() => {
                return response.status(204);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `工序範本資料 [${targetProcTemplateId}] 更新發生錯誤: ${error}`)
                );
            }).finally(() => {
                knex.destroy();
            });
    })
    .patch((request, response, next) => {
        let targetProcTemplateId = request.params.targetProcTemplateId;
        let recordData = {};
        for (let property in request.body) {
            recordData[property] = request.body[property];
        }
        let knex = require('knex')(mssqlConfig);
        knex('scheduleSystem.dbo.procTemplate').update(recordData).where({ id: targetProcTemplateId }).debug(false)
            .then(() => {
                return response.status(204);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `工序範本資料 [${targetProcTemplateId}] 局部更新發生錯誤: ${error}`)
                );
            }).finally(() => {
                knex.destroy();
            });
    })
    .delete((request, response, next) => {
        let targetProcTemplateId = request.params.targetProcTemplateId;
        let knex = require('knex')(mssqlConfig);
        knex('scheduleSystem.dbo.procTemplate').delete().where({ id: targetProcTemplateId }).debug(false)
            .then(() => {
                return response.status(204);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `工序範本資料 [${targetProcTemplateId}] 刪除發生錯誤: ${error}`)
                );
            }).finally(() => {
                knex.destroy();
            });
    });

router.route('/data/procTemplate')
    .all(tokenValidation)
    .get((request, response, next) => {
        let knex = require('knex')(mssqlConfig);
        knex('scheduleSystem.dbo.procTemplate').select('*').orderBy('displaySequence').debug(false)
            .then((resultset) => {
                return response.status(200).json(resultset);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `工序範本資料表讀取發生錯誤: ${error}`)
                );
            }).finally(() => {
                knex.destroy();
            });
    })
    .post((request, response, next) => {
        let recordData = {
            id: uuidV4().toUpperCase(),
            reference: request.body.reference,
            displaySequence: null,
            deprecated: currentDatetimeString()
        };
        let knex = require('knex')(mssqlConfig);
        knex.transaction((trx) => {
            return trx('scheduleSystem.dbo.procTemplate').max('displaySequence as maxDisplaySequence').debug(false)
                .then((resultset) => {
                    recordData.displaySequence = resultset[0].maxDisplaySequence === null ? 0 : resultset[0].maxDisplaySequence + 1;
                    return trx('scheduleSystem.dbo.procTemplate').insert(recordData)
                        .returning(['id', 'reference', 'displaySequence', 'deprecated']).debug(false);
                });
        }).then((resultset) => {
            return response.status(200).json(resultset[0]);
        }).catch((error) => {
            return response.status(500).json(
                endpointErrorHandler(
                    request.method,
                    request.originalUrl,
                    `工序範本新增發生錯誤: ${error}`)
            );
        }).finally(() => {
            knex.destroy();
        });
    });

module.exports = router;
