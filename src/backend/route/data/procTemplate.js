import bodyParser from 'body-parser';
import express from 'express';
import uuidV4 from 'uuid/v4';

import { endpointErrorHandler } from '../../utility/endpointErrorHandler.js';
import { mssqlConfig } from '../../config/mssqlServer.js';
import { currentDatetimeString } from '../../utility/timeUtility.js';
import tokenValidation from '../../middleware/tokenValidation.js';

const router = express.Router();
router.use(bodyParser.json());

/*
route definitions

get /data/processTemplates/:id - get a particular record
patch /data/processTemplates/:id -  update 'reference' field of a particular record
delete /data/processTemplates/:id - deactivate a particular record

patch /data/processTemplates/:id/:displaySequence - reorder active record list

get /data/processTemplates - get all active records
post /data/processTemplates - add new records to the end of list

get /data/processTemplates/inactive - get all inactive but not deprecated records

patch /data/processTemplates/inactive/:id - reactivate a record and place at the end of list (assuming record isn't deprecated)
delete /data/processTemplates/inactive/:id - deprecate a record

get /data/processTemplates/all - get all records
*/

// TODO needs to work sorting
// TODO rename file to processTempate.js

router.route('/data/processTemplates/:id')
    .all(tokenValidation)
    .get((request, response, next) => { // get a particular record
        let id = request.params.id;
        let knex = require('knex')(mssqlConfig);
        knex('scheduleSystem.dbo.procTemplate').select('*').where({ id: id }).debug(false)
            .then((resultset) => {
                return response.status(200).json(resultset[0]);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `工序範本資料 [${id}] 讀取發生錯誤: ${error}`)
                );
            }).finally(() => {
                knex.destroy();
            });
    })
    .patch((request, response, next) => { // update target record's reference
        let id = request.params.id;
        // check if the request has valid reference data
        if ((request.body.reference === undefined) || (request.body.reference === null) || (request.body.reference === '')) {
            return response.status(400).json(
                endpointErrorHandler(
                    request.method,
                    request.originalUrl,
                    `工序範本資料 [${id}] 名稱更新發生錯誤: reference parameter is invalid`)
            );
        } else {
            let knex = require('knex')(mssqlConfig);
            knex('scheduleSystem.dbo.processTemplate').update({ reference: request.body.reference }).where({ id: id }).debug(false)
                .then(() => {
                    return response.status(204);
                }).catch((error) => {
                    return response.status(500).json(
                        endpointErrorHandler(
                            request.method,
                            request.originalUrl,
                            `工序範本資料 [${id}] 名稱更新發生錯誤: ${error}`)
                    );
                }).finally(() => {
                    knex.destroy();
                });
        }
    })
    .delete((request, response, next) => { // deactivate target record (assuming it's not deprecated)
        let id = request.params.id;
        let targetRecordDisplaySequence = null;
        let knex = require('knex')(mssqlConfig);
        knex.transaction((trx) => {
            // get target record's displaySequence value
            return trx('scheduleSystem.dbo.processTemplate').select('displaySequence').where({ id: id }).debug(false)
                .then((resultset) => {
                    targetRecordDisplaySequence = resultset[0].displaySequence;
                    // deactivate the target record
                    return trx('scheduleSystem.dbo.processTemplate').update({
                        displaySequence: null,
                        active: 0,
                        deprecated: null
                    }).where({ id: id }).debug(false);
                }).then(() => {
                    // update all active records that are preceeded by the target record to displaySequence -1
                    // note: raw query was used due to an issue of getting standard knex query to work
                    return trx.raw('UPDATE scheduleSystem.dbo.processTemplate SET displaySequence=displaySequence-1 WHERE active=1 AND displaySequence>=?;', [targetRecordDisplaySequence]).debug(false);
                });
        }).then(() => {
            return response.status(204);
        }).catch((error) => {
            return response.status(500).json(
                endpointErrorHandler(
                    request.method,
                    request.originalUrl,
                    `工序範本資料 [${id}] 停用發生錯誤: ${error}`)
            );
        }).finally(() => {
            knex.destroy();
        });
    });

router.route('/data/processTemplates/:id/:displaySequence')
    .all(tokenValidation)
    .patch((request, response, next) => { // update target record's reference
        let id = request.params.id;
        let targetRecordDisplaySequence = null;
        let knex = require('knex')(mssqlConfig);
        knex.transaction((trx) => {
            // get target record's current displaySequence value
            return trx('scheduleSystem.dbo.processTemplate').select('displaySequence').where({ id: id }).debug(false)
                .then((resultset) => {
                    targetRecordDisplaySequence = resultset[0].displaySequence;
                    // adjust displaySequence of all affected active records
                    // note: raw query was used due to an issue of getting standard knex query to work
                    return trx.raw('UPDATE scheduleSystem.dbo.processTemplate SET displaySequence=displaySequence-1 WHERE active=1 AND displaySequence>? AND displaySequence<=?;', [targetRecordDisplaySequence, request.params.displaySequence]).debug(false);
                }).then(() => { // update the target with intended displaySequence
                    return trx('scheduleSystem.dbo.processTemplate')
                        .update({ displaySequence: request.params.displaySequence })
                        .where({ id: id }).debug(false);
                }).then(() => { // get a fresh set of processTemplate data
                    return trx('scheduleSystem.dbo.processTemplate')
                        .select('*').where({ active: 1, deprecated: null })
                        .orderBy('displaySequence').debug(false);
                });
        }).then((resultset) => {
            return response.status(200).json(resultset);
        }).catch((error) => {
            return response.status(500).json(
                endpointErrorHandler(
                    request.method,
                    request.originalUrl,
                    `工序範本資料順序調整發生錯誤: ${error}`)
            );
        }).finally(() => {
            knex.destroy();
        });
    });

router.route('/data/processTemplates')
    .all(tokenValidation)
    .get((request, response, next) => { // get all active records
        let knex = require('knex')(mssqlConfig);
        knex('scheduleSystem.dbo.processTemplate').select('*').where({ active: 1, deprecated: null }).orderBy('displaySequence').debug(false)
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
    .post((request, response, next) => { // insert a new active record to the end of the list
        let recordData = {
            id: uuidV4().toUpperCase(),
            reference: request.body.reference,
            displaySequence: null,
            deprecated: null
        };
        let knex = require('knex')(mssqlConfig);
        knex.transaction((trx) => {
            return trx('scheduleSystem.dbo.processTemplate').max('displaySequence as maxDisplaySequence').debug(false)
                .then((resultset) => {
                    recordData.displaySequence = resultset[0].maxDisplaySequence === null ? 0 : resultset[0].maxDisplaySequence + 1;
                    return trx('scheduleSystem.dbo.processTemplate').insert(recordData)
                        .returning(['id', 'reference', 'displaySequence', 'active', 'deprecated']).debug(false);
                });
        }).then((resultset) => {
            return response.status(201).json(resultset[0]);
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

router.route('data/procTemplates/inactive')
    .all(tokenValidation)
    .get((request, response, next) => { // get all inactive but not deprecated records
        let id = request.params.id;
        let knex = require('knex')(mssqlConfig);
        knex('scheduleSystem.dbo.processTemplate').select('*').where({ active: 0, deprecated: null }).debug(false)
            .then((resultset) => {
                return response.status(200).json(resultset);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `工序範本資料 [${id}] 讀取發生錯誤: ${error}`)
                );
            }).finally(() => {
                knex.destroy();
            });
    });

router.route('/data/processTemplates/inactive/:id')
    .all(tokenValidation)
    .patch((request, response, next) => { // reactivate record and place at the end of list (assuming the record is not deprecated)
        let id = request.params.id;
        let knex = require('knex')(mssqlConfig);
        knex.transaction((trx) => {
            // get the current highest displaySequence value
            return trx('scheduleSystem.dbo.processTemplate').max('displaySequence as maxDisplaySequence').debug(false)
                .then((resultset) => {
                    return trx('scheduleSystem.dbo.processTemplate').update({
                        displaySequence: resultset[0].maxDisplaySequence === null ? 0 : resultset[0].maxDisplaySequence + 1,
                        active: 1,
                        deprecated: null
                    }).where({
                        id: id
                    }).returning(['id', 'reference', 'displaySequence', 'active', 'deprecated']).debug(false);
                });
        }).then((resultset) => {
            return response.status(200).json(resultset[0]);
        }).catch((error) => {
            return response.status(500).json(
                endpointErrorHandler(
                    request.method,
                    request.originalUrl,
                    `工序範本 [${id}] 重新啟用發生錯誤: ${error}`)
            );
        }).finally(() => {
            knex.destroy();
        });
    })
    .delete((request, response, next) => { // deprecate target record
        let id = request.params.id;
        let targetRecordDisplaySequence = null;
        let knex = require('knex')(mssqlConfig);
        knex.transaction((trx) => {
            // get target record's original displaySequence value
            return trx('scheduleSystem.dbo.processTemplate')
                .select('displaySequence').where({ id: id }).debug(false)
                .then((resultset) => {
                    targetRecordDisplaySequence = resultset[0].displaySequence;
                    // deactivate and deprecate the target record
                    return trx('scheduleSystem.dbo.processTemplate').update({
                        displaySequence: null,
                        active: 0,
                        deprecated: currentDatetimeString()
                    }).where({ id: id }).debug(false);
                }).then(() => {
                    // check if list resequence is needed
                    if (targetRecordDisplaySequence === null) { // not needed (record was deactivated to begin with)
                        // get a fresh set of processTemplate data
                        return trx('scheduleSystem.dbo.processTemplate')
                            .select('*').where({ active: 1, deprecated: null })
                            .orderBy('displaySequence').debug(false);
                    } else { // resequence required
                        // update all active records that are preceeded by the target record to displaySequence -1
                        // note: raw query was used due to an issue of getting standard knex query to work
                        return trx.raw('UPDATE scheduleSystem.dbo.processTemplate SET displaySequence=displaySequence-1 WHERE active=1 AND displaySequence>?;', [targetRecordDisplaySequence]).debug(false)
                            .then(() => {
                                // get a fresh set of processTemplate data
                                return trx('scheduleSystem.dbo.processTemplate')
                                    .select('*').where({ active: 1, deprecated: null })
                                    .orderBy('displaySequence').debug(false);
                            });
                    }
                });
        }).then((resultset) => {
            return response.status(200).json(resultset);
        }).catch((error) => {
            return response.status(500).json(
                endpointErrorHandler(
                    request.method,
                    request.originalUrl,
                    `工序範本資料 [${id}] 停用發生錯誤: ${error}`)
            );
        }).finally(() => {
            knex.destroy();
        });
    });

router.route('data/procTemplates/all')
    .all(tokenValidation)
    .get((request, response, next) => { // get all template records
        let id = request.params.id;
        let knex = require('knex')(mssqlConfig);
        knex('scheduleSystem.dbo.processTemplate').select('*').debug(false)
            .then((resultset) => {
                return response.status(200).json(resultset);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `工序範本資料 [${id}] 讀取發生錯誤: ${error}`)
                );
            }).finally(() => {
                knex.destroy();
            });
    });

module.exports = router;
