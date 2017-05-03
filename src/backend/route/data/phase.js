import bodyParser from 'body-parser';
import express from 'express';
import uuidV4 from 'uuid/v4';

import { endpointErrorHandler } from '../../utility/endpointErrorHandler.js';
import { mssqlConfig } from '../../config/database.js';
import { currentDatetimeString } from '../../utility/timeUtility.js';
import tokenValidation from '../../middleware/tokenValidation.js';

const router = express.Router();
router.use(bodyParser.json());

const dataTable = 'scheduleSystem.dbo.phase';

/*
route definitions

get /data/phases/id/:id - get a particular record
patch /data/phases/id/:id -  update 'reference' field of a particular record
delete /data/phases/id/:id - deactivate target record and reorder (deprecated IS NULL is assumed to be true)

patch /data/phases/id/:id/displaySequence/:displaySequence - reorder active record list

get /data/phases - get all active records
post /data/phases - add new records to the end of list

get /data/phases/inactive - get all inactive but not deprecated records

patch /data/phases/inactive/id/:id - reactivate a record and place at the end of list (assuming record isn't deprecated)
delete /data/phases/inactive/id/:id - deprecate an inactive record

get /data/phases/all - get all records
*/

router.route('/data/phases/id/:id')
    .all(tokenValidation)
    .get((request, response, next) => { // get a particular record
        let id = request.params.id;
        let knex = require('knex')(mssqlConfig);
        knex(dataTable)
            .select('*')
            .where({ id: id }).debug(false)
            .then((resultset) => {
                return response.status(200).json(resultset);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `工作階段資料 [${id}] 讀取發生錯誤: ${error}`)
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
                    `工作階段資料 [${id}] 名稱更新發生錯誤: reference parameter is invalid`)
            );
        } else {
            let knex = require('knex')(mssqlConfig);
            knex(dataTable)
                .update({ reference: reference })
                .where({ id: id }).debug(false)
                .then(() => {
                    return response.status(204).end();
                }).catch((error) => {
                    return response.status(500).json(
                        endpointErrorHandler(
                            request.method,
                            request.originalUrl,
                            `工作階段資料 [${id}] 名稱更新發生錯誤: ${error}`)
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
            return trx(dataTable)
                .select('displaySequence')
                .where({ id: id }).debug(false)
                .then((resultset) => {
                    targetRecordDisplaySequence = resultset[0].displaySequence;
                    // deactivate the target record
                    return trx(dataTable)
                        .update({
                            displaySequence: null,
                            active: 0
                        }).where({ id: id }).debug(false);
                }).then(() => {
                    // update all active records that are preceeded by the target record to displaySequence -1
                    return trx(dataTable)
                        .decrement('displaySequence', 1)
                        .where({
                            active: 1,
                            displaySequence: targetRecordDisplaySequence
                        })
                        .debug(false);
                }).then(() => { // get a fresh set of jobType data
                    return trx(dataTable)
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
                    `工作階段資料 [${id}] 停用發生錯誤: ${error}`)
            );
        }).finally(() => {
            knex.destroy();
        });
    });

router.route('/data/phases/id/:id/displaySequence/:displaySequence')
    .all(tokenValidation)
    .patch((request, response, next) => { // reorder active record list
        let id = request.params.id;
        let originalSeqValue = null;
        let intendedSeqValue = request.params.displaySequence;
        let upperLimit = null;
        let knex = require('knex')(mssqlConfig);
        knex.transaction((trx) => {
            // get target record's current displaySequence value
            return trx(dataTable)
                .select('displaySequence')
                .where({ id: id }).debug(false)
                .then((resultset) => {
                    originalSeqValue = resultset[0].displaySequence;
                    // get the current highest displaySequence value
                    return trx(dataTable)
                        .max('displaySequence as maxDisplaySequence').debug(false);
                }).then((resultset) => {
                    upperLimit = resultset[0].maxDisplaySequence;
                    if (
                        // check if the intended sequence value is out of range
                        (upperLimit < intendedSeqValue) ||
                        // check if the target record is already at the intended sequence value
                        (originalSeqValue === intendedSeqValue)
                    ) { // skip operation
                        return Promise.resolve();
                    } else { // check the original and final displaySequence to determine how to reorder
                        if (originalSeqValue < intendedSeqValue) {
                            // adjust displaySequence of all affected active records
                            return trx(dataTable)
                                .decrement('displaySequence', 1)
                                .where({ active: 1 })
                                .where('displaySequence', '>', originalSeqValue)
                                .where('displaySequence', '<=', intendedSeqValue)
                                .debug(false);
                        } else { // adjust displaySequence of all affected active records
                            return trx(dataTable)
                                .increment('displaySequence', 1)
                                .where({ active: 1 })
                                .where('displaySequence', '>=', intendedSeqValue)
                                .where('displaySequence', '<', originalSeqValue)
                                .debug(false);
                        }
                    }
                }).then(() => {
                    if (
                        // check if the intended sequence value is out of range
                        (upperLimit < intendedSeqValue) ||
                        // check if the target record is already at the intended sequence value
                        (originalSeqValue === intendedSeqValue)
                    ) { // skip operation
                        return Promise.resolve();
                    } else { // update the target with intended displaySequence
                        return trx(dataTable)
                            .update({ displaySequence: intendedSeqValue })
                            .where({ id: id }).debug(false);
                    }
                }).then(() => { // get a fresh set of jobType data
                    return trx(dataTable)
                        .select('*')
                        .where({ active: 1, deprecated: null })
                        // .orderBy('displaySequence')
                        .debug(false);
                });
        }).then((resultset) => {
            return response.status(200).json(resultset);
        }).catch((error) => {
            return response.status(500).json(
                endpointErrorHandler(
                    request.method,
                    request.originalUrl,
                    `工作階段資料 [${id}] 順序調整發生錯誤: ${error}`)
            );
        }).finally(() => {
            knex.destroy();
        });
    });

router.route('/data/phases')
    .all(tokenValidation)
    .get((request, response, next) => { // get all active records
        let knex = require('knex')(mssqlConfig);
        knex(dataTable)
            .select('*')
            .where({ active: 1, deprecated: null })
            .orderBy('displaySequence').debug(false)
            .then((resultset) => {
                return response.status(200).json(resultset);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `工作階段資料表讀取發生錯誤: ${error}`)
                );
            }).finally(() => {
                knex.destroy();
            });
    })
    .post((request, response, next) => { // insert a new active record to the end of the list
        let knex = require('knex')(mssqlConfig);
        knex.transaction((trx) => {
            // get the current highest displaySequence value
            return trx(dataTable).max('displaySequence as maxDisplaySequence').debug(false)
                .then((resultset) => {
                    let recordData = {
                        id: uuidV4().toUpperCase(),
                        reference: request.body.reference,
                        displaySequence: resultset[0].maxDisplaySequence === null ? 0 : resultset[0].maxDisplaySequence + 1,
                        active: 1,
                        deprecated: null
                    };
                    // check if the requested 'reference' is duplicated
                    return trx(dataTable)
                        .select('*').where({ reference: request.body.reference }).debug(false)
                        .then((resultset) => {
                            if (resultset.length === 0) { // insert new record if no duplicates are found
                                return trx(dataTable)
                                    .insert(recordData)
                                    .returning(['id', 'reference', 'displaySequence', 'active', 'deprecated'])
                                    .debug(false);
                            } else { // returns the existing record with the same reference
                                return trx(dataTable)
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
                    `工作類別新增發生錯誤: ${error}`)
            );
        }).finally(() => {
            knex.destroy();
        });
    });

router.route('/data/phases/inactive')
    .all(tokenValidation)
    .get((request, response, next) => { // get all inactive but not deprecated records
        let id = request.params.id;
        let knex = require('knex')(mssqlConfig);
        knex(dataTable)
            .select('*')
            .where({ active: 0, deprecated: null }).debug(false)
            .then((resultset) => {
                return response.status(200).json(resultset);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `工作階段資料(停用中) [${id}] 讀取發生錯誤: ${error}`)
                );
            }).finally(() => {
                knex.destroy();
            });
    });

router.route('/data/phases/inactive/id/:id')
    .all(tokenValidation)
    .patch((request, response, next) => { // reactivate record
        let id = request.params.id;
        let knex = require('knex')(mssqlConfig);
        knex.transaction((trx) => {
            // get the current highest displaySequence value
            return trx(dataTable)
                .max('displaySequence as maxDisplaySequence').debug(false)
                .then((resultset) => {
                    return trx(dataTable)
                        .update({
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
                    `工作類別 [${id}] 重新啟用發生錯誤: ${error}`)
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
            return trx(dataTable) // deprecate the target record
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
                    `工作階段資料 [${id}] 停用發生錯誤: ${error}`)
            );
        }).finally(() => {
            knex.destroy();
        });
    });

router.route('/data/phases/deprecated')
    .all(tokenValidation)
    .get((request, response, next) => { // get all deprecated records
        let id = request.params.id;
        let knex = require('knex')(mssqlConfig);
        knex(dataTable)
            .select('*')
            .whereNotNull('deprecated').debug(false)
            .then((resultset) => {
                return response.status(200).json(resultset);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `工作階段資料(永遠停用項目) [${id}] 讀取發生錯誤: ${error}`)
                );
            }).finally(() => {
                knex.destroy();
            });
    });

router.route('/data/phases/all')
    .all(tokenValidation)
    .get((request, response, next) => { // get all records
        let id = request.params.id;
        let knex = require('knex')(mssqlConfig);
        knex(dataTable).select('*')
            .orderBy('deprecated')
            .orderBy('active', 'desc')
            .orderBy('displaySequence').debug(false)
            .then((resultset) => {
                return response.status(200).json(resultset);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `工作階段資料(所有資料) [${id}] 讀取發生錯誤: ${error}`)
                );
            }).finally(() => {
                knex.destroy();
            });
    });

module.exports = router;