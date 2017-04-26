import bodyParser from 'body-parser';
import express from 'express';
import uuidV4 from 'uuid/v4';

import { endpointErrorHandler } from '../../utility/endpointErrorHandler.js';
import { mssqlConfig } from '../../config/mssqlServer.js';
import { currentDatetimeString } from '../../utility/timeUtility.js';
import tokenValidation from '../../middleware/tokenValidation.js';

const router = express.Router();
router.use(bodyParser.json());

router.route('/data/procTemplate')
    .all(tokenValidation)
    .get((request, response, next) => {
        let knex = require('knex')(mssqlConfig);
        knex('scheduleSystem.dbo.procTemplate').select('*').orderBy('displaySequence').debug(false)
            .then((resultset) => {
                return response.status(200).json({ procTemplate: resultset });
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
        let newId = uuidV4().toUpperCase();
        let knex = require('knex')(mssqlConfig);
        knex.transaction((trx) => {
            return trx('scheduleSystem.dbo.procTemplate').max('displaySequence as maxDisplaySequence').debug(false)
                .then((resultset) => {
                    console.log(resultset);
                    let newRecord = {
                        id: newId,
                        reference: request.body.templateName,
                        displaySequence: resultset[0].maxDisplaySequence === null ? 0 : resultset[0].maxDisplaySequence + 1,
                        deprecated: currentDatetimeString()
                    };
                    return trx.insert(newRecord).into('scheduleSystem.dbo.procTemplate').debug(false);
                }).then(() => {
                    return trx('scheduleSystem.dbo.procTemplate').select('*').where({ id: newId }).debug(false);
                });
        }).then((resultset) => {
            return response.status(200).json({ newRecord: resultset[0] });
        }).catch((error) => {
            return response.status(500).json(
                endpointErrorHandler(
                    request.method,
                    request.originalUrl,
                    `工序範本新建發生錯誤: ${error}`)
            );
        }).finally(() => {
            knex.destroy();
        });
    });

module.exports = router;
