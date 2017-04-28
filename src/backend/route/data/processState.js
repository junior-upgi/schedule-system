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

get /data/processStates/id/:id - get a particular record
patch /data/processStates/id/:id -  update 'reference' field of a particular record
delete /data/processStates/id/:id - deactivate target record and reorder (deprecated IS NULL is assumed to be true)

patch /data/processStates/id/:id/displaySequence/:displaySequence - reorder active record list

get /data/processStates - get all active records
post /data/processStates - add new records to the end of list

get /data/processStates/inactive - get all inactive but not deprecated records

patch /data/processStates/inactive/id/:id - reactivate a record and place at the end of list (assuming record isn't deprecated)
delete /data/processStates/inactive/id/:id - deprecate an inactive record

get /data/processStates/all - get all records
*/

router.route('/data/processStates/id/:id')
    .all(tokenValidation)
    .get((request, response, next) => { // get a particular record
        let id = request.params.id;
        let knex = require('knex')(mssqlConfig);
        knex('scheduleSystem.dbo.processState').select('*').where({ id: id }).debug(false)
            .then((resultset) => {
                return response.status(200).json(resultset);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `工序狀態資料 [${id}] 讀取發生錯誤: ${error}`)
                );
            }).finally(() => {
                knex.destroy();
            });
    })
    .patch((request, response, next) => { // update 'reference' field of a particular record
        let id = request.params.id;
        let reference = request.body.reference;
        // check if the request has valid data
        if ((reference === undefined) || (reference === null) || (reference === '')) {
            return response.status(400).json(
                endpointErrorHandler(
                    request.method,
                    request.originalUrl,
                    `工序狀態資料 [${id}] 名稱更新發生錯誤: reference parameter is invalid`)
            );
        } else {
            let knex = require('knex')(mssqlConfig);
            knex('scheduleSystem.dbo.processState').update({ reference: reference }).where({ id: id }).debug(false)
                .then(() => {
                    return response.status(204).end();
                }).catch((error) => {
                    return response.status(500).json(
                        endpointErrorHandler(
                            request.method,
                            request.originalUrl,
                            `工序狀態資料 [${id}] 名稱更新發生錯誤: ${error}`)
                    );
                }).finally(() => {
                    knex.destroy();
                });
        }
    })
    .delete((request, response, next) => { // deactivate target record and reorder (deprecated=null is assumed to be true)
        let id = request.params.id;
        let targetRecordDisplaySequence = null;
        let knex = require('knex')(mssqlConfig);
        knex.transaction((trx) => {
            // get target record's current data
            return trx('scheduleSystem.dbo.processState').select('displaySequence').where({ id: id }).debug(false)
                .then((resultset) => {
                    targetRecordDisplaySequence = resultset[0].displaySequence;
                    // deactivate the target record
                    return trx('scheduleSystem.dbo.processState').update({
                        displaySequence: null,
                        active: 0
                    }).where({ id: id }).debug(false);
                }).then(() => {
                    // update all active records that are preceeded by the target record to displaySequence -1
                    // note: raw query was used due to an issue of getting standard knex query to work
                    return trx.raw('UPDATE scheduleSystem.dbo.processState SET displaySequence=displaySequence-1 WHERE active=1 AND displaySequence>?;', [targetRecordDisplaySequence]).debug(false);
                }).then(() => { // get a fresh set of processState data
                    return trx('scheduleSystem.dbo.processState')
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
                    `工序狀態資料 [${id}] 停用發生錯誤: ${error}`)
            );
        }).finally(() => {
            knex.destroy();
        });
    });

router.route('/data/processStates/id/:id/displaySequence/:displaySequence')
    .all(tokenValidation)
    .patch((request, response, next) => { // reorder active record list
        let id = request.params.id;
        let targetRecordDisplaySequence = null;
        let knex = require('knex')(mssqlConfig);
        knex.transaction((trx) => {
            // get target record's current displaySequence value
            return trx('scheduleSystem.dbo.processState').select('displaySequence').where({ id: id }).debug(false)
                .then((resultset) => {
                    targetRecordDisplaySequence = resultset[0].displaySequence;
                    // check the original and final displaySequence to determine how to reorder
                    if (targetRecordDisplaySequence < request.params.displaySequence) {
                        // adjust displaySequence of all affected active records
                        // note: raw query was used due to an issue of getting standard knex query to work
                        return trx.raw('UPDATE scheduleSystem.dbo.processState SET displaySequence=displaySequence-1 WHERE active=1 AND displaySequence>? AND displaySequence<=?;', [targetRecordDisplaySequence, request.params.displaySequence]).debug(false);
                    } else if (targetRecordDisplaySequence > request.params.displaySequence) {
                        // adjust displaySequence of all affected active records
                        // note: raw query was used due to an issue of getting standard knex query to work
                        return trx.raw('UPDATE scheduleSystem.dbo.processState SET displaySequence=displaySequence+1 WHERE active=1 AND displaySequence>=? AND displaySequence<?;', [request.params.displaySequence, targetRecordDisplaySequence]).debug(false);
                    } else { // original value and target value are the same
                        return Promise.resolve();
                    }
                }).then(() => { // update the target with intended displaySequence
                    if (targetRecordDisplaySequence !== request.params.displaySequenc) {
                        return trx('scheduleSystem.dbo.processState')
                            .update({ displaySequence: request.params.displaySequence })
                            .where({ id: id }).debug(false);
                    } else {
                        return Promise.resolve();
                    }
                }).then(() => { // get a fresh set of processState data
                    return trx('scheduleSystem.dbo.processState')
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
                    `工序狀態資料 [${id}] 順序調整發生錯誤: ${error}`)
            );
        }).finally(() => {
            knex.destroy();
        });
    });

router.route('/data/processStates')
    .all(tokenValidation)
    .get((request, response, next) => { // get all active records
        let knex = require('knex')(mssqlConfig);
        knex('scheduleSystem.dbo.processState')
            .select('*').where({ active: 1, deprecated: null })
            .orderBy('displaySequence').debug(false)
            .then((resultset) => {
                return response.status(200).json(resultset);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `工序狀態資料表讀取發生錯誤: ${error}`)
                );
            }).finally(() => {
                knex.destroy();
            });
    })
    .post((request, response, next) => { // insert a new active record to the end of the list
        let knex = require('knex')(mssqlConfig);
        knex.transaction((trx) => {
            return trx('scheduleSystem.dbo.processState').max('displaySequence as maxDisplaySequence').debug(false)
                .then((resultset) => {
                    let recordData = {
                        id: uuidV4().toUpperCase(),
                        reference: request.body.reference,
                        displaySequence: resultset[0].maxDisplaySequence === null ? 0 : resultset[0].maxDisplaySequence + 1,
                        active: 1,
                        deprecated: null
                    };
                    // check if the requested 'reference' is duplicated
                    return trx('scheduleSystem.dbo.processState')
                        .select('*').where({ reference: request.body.reference }).debug(false)
                        .then((resultset) => {
                            if (resultset.length === 0) { // insert new record if no duplicates are found
                                return trx('scheduleSystem.dbo.processState')
                                    .insert(recordData)
                                    .returning(['id', 'reference', 'displaySequence', 'active', 'deprecated'])
                                    .debug(false);
                            } else { // returns the existing record with the same reference
                                return trx('scheduleSystem.dbo.processState')
                                    .select('*').where({ reference: request.body.reference }).debug(false);
                            }
                        });
                });
        }).then((resultset) => {
            return response.status(201).json(resultset);
        }).catch((error) => {
            return response.status(500).json(
                endpointErrorHandler(
                    request.method,
                    request.originalUrl,
                    `工序狀態新增發生錯誤: ${error}`)
            );
        }).finally(() => {
            knex.destroy();
        });
    });

router.route('/data/processStates/inactive')
    .all(tokenValidation)
    .get((request, response, next) => { // get all inactive but not deprecated records
        let id = request.params.id;
        let knex = require('knex')(mssqlConfig);
        knex('scheduleSystem.dbo.processState').select('*').where({ active: 0, deprecated: null }).debug(false)
            .then((resultset) => {
                return response.status(200).json(resultset);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `工序狀態資料 [${id}] 讀取發生錯誤: ${error}`)
                );
            }).finally(() => {
                knex.destroy();
            });
    });

router.route('/data/processStates/inactive/id/:id')
    .all(tokenValidation)
    .patch((request, response, next) => { // reactivate record
        let id = request.params.id;
        let knex = require('knex')(mssqlConfig);
        knex.transaction((trx) => {
            // get the current highest displaySequence value
            return trx('scheduleSystem.dbo.processState').max('displaySequence as maxDisplaySequence').debug(false)
                .then((resultset) => {
                    return trx('scheduleSystem.dbo.processState').update({
                        displaySequence: resultset[0].maxDisplaySequence === null ? 0 : resultset[0].maxDisplaySequence + 1,
                        active: 1,
                        deprecated: null
                    }).where({
                        id: id,
                        active: 0
                    }).returning(['id', 'reference', 'displaySequence', 'active', 'deprecated']).debug(false);
                });
        }).then((resultset) => {
            return response.status(200).json(resultset);
        }).catch((error) => {
            return response.status(500).json(
                endpointErrorHandler(
                    request.method,
                    request.originalUrl,
                    `工序狀態 [${id}] 重新啟用發生錯誤: ${error}`)
            );
        }).finally(() => {
            knex.destroy();
        });
    })
    .delete((request, response, next) => { // deprecate an inactive record
        let id = request.params.id;
        let standardDeprecatedData = {
            displaySequence: null,
            deprecated: currentDatetimeString()
        };
        let knex = require('knex')(mssqlConfig);
        knex.transaction((trx) => {
            // deprecate the target record
            return trx('scheduleSystem.dbo.processState')
                .update(standardDeprecatedData)
                .where({
                    id: id,
                    active: 0
                }).debug(false);
        }).then(() => {
            return response.status(204).end();
        }).catch((error) => {
            return response.status(500).json(
                endpointErrorHandler(
                    request.method,
                    request.originalUrl,
                    `工序狀態資料 [${id}] 停用發生錯誤: ${error}`)
            );
        }).finally(() => {
            knex.destroy();
        });
    });

router.route('/data/processStates/all')
    .all(tokenValidation)
    .get((request, response, next) => { // get all records
        let id = request.params.id;
        let knex = require('knex')(mssqlConfig);
        knex('scheduleSystem.dbo.processState').select('*')
            .orderBy('deprecated').orderBy('active', 'desc').orderBy('displaySequence').debug(false)
            .then((resultset) => {
                return response.status(200).json(resultset);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `工序狀態資料 [${id}] 讀取發生錯誤: ${error}`)
                );
            }).finally(() => {
                knex.destroy();
            });
    });

module.exports = router;
