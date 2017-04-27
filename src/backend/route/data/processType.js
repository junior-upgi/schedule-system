import bodyParser from 'body-parser';
import express from 'express';
import uuidV4 from 'uuid/v4';

import { endpointErrorHandler } from '../../utility/endpointErrorHandler.js';
import { mssqlConfig } from '../../config/mssqlServer.js';
import { currentDatetimeString } from '../../utility/timeUtility.js';
import tokenValidation from '../../middleware/tokenValidation.js';

const router = express.Router();
router.use(bodyParser.json());

router.route('/data/processType/:id')
    .all(tokenValidation)
    .get((request, response, next) => {
        let id = request.params.id;
        let knex = require('knex')(mssqlConfig);
        knex('scheduleSystem.dbo.processType').select('*').where({ id: id }).debug(false)
            .then((resultset) => {
                return response.status(200).json(resultset[0]);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `工序項目資料 [${id}] 讀取發生錯誤: ${error}`)
                );
            }).finally(() => {
                knex.destroy();
            });
    })
    .put((request, response, next) => {
        let id = request.params.id;
        let knex = require('knex')(mssqlConfig);
        knex('scheduleSystem.dbo.processType').update({
                reference: request.body.reference,
                displaySequence: request.body.displaySequence,
                deprecated: request.body.deprecated
            }).where({ id: id }).debug(false)
            .then(() => {
                return response.status(204);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `工序項目資料 [${id}] 更新發生錯誤: ${error}`)
                );
            }).finally(() => {
                knex.destroy();
            });
    })
    .patch((request, response, next) => {
        let id = request.params.id;
        let recordData = {};
        for (let property in request.body) {
            recordData[property] = request.body[property];
        }
        let knex = require('knex')(mssqlConfig);
        knex('scheduleSystem.dbo.processType').update(recordData).where({ id: id }).debug(false)
            .then(() => {
                return response.status(204);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `工序項目資料 [${id}] 局部更新發生錯誤: ${error}`)
                );
            }).finally(() => {
                knex.destroy();
            });
    })
    .delete((request, response, next) => {
        let id = request.params.id;
        let knex = require('knex')(mssqlConfig);
        knex('scheduleSystem.dbo.processType').delete().where({ id: id }).debug(false)
            .then(() => {
                return response.status(204);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `工序項目資料 [${id}] 刪除發生錯誤: ${error}`)
                );
            }).finally(() => {
                knex.destroy();
            });
    });

router.route('/data/processType')
    .all(tokenValidation)
    .get((request, response, next) => {
        let knex = require('knex')(mssqlConfig);
        knex('scheduleSystem.dbo.processType').select('*').orderBy('displaySequence').debug(false)
            .then((resultset) => {
                return response.status(200).json(resultset);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `工序項目資料表讀取發生錯誤: ${error}`)
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
            return trx('scheduleSystem.dbo.processType').max('displaySequence as maxDisplaySequence').debug(false)
                .then((resultset) => {
                    recordData.displaySequence = resultset[0].maxDisplaySequence === null ? 0 : resultset[0].maxDisplaySequence + 1;
                    return trx('scheduleSystem.dbo.processType').insert(recordData)
                        .returning(['id', 'reference', 'displaySequence', 'deprecated']).debug(false);
                });
        }).then((resultset) => {
            return response.status(200).json(resultset[0]);
        }).catch((error) => {
            return response.status(500).json(
                endpointErrorHandler(
                    request.method,
                    request.originalUrl,
                    `工序項目新增發生錯誤: ${error}`)
            );
        }).finally(() => {
            knex.destroy();
        });
    });

module.exports = router;
