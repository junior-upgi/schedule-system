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

get /data/productTypes/id/:id - get a particular record
patch /data/productTypes/id/:id -  update 'reference' field of a particular record
delete /data/productTypes/id/:id - deactivate target record and reorder (deprecated IS NULL is assumed to be true)

patch /data/productTypes/id/:id/displaySequence/:displaySequence - reorder active record list

get /data/productTypes - get all active records
post /data/productTypes - add new records to the end of list

get /data/productTypes/inactive - get all inactive but not deprecated records

patch /data/productTypes/inactive/id/:id - reactivate a record and place at the end of list (assuming record isn't deprecated)
delete /data/productTypes/inactive/id/:id - deprecate an inactive record

get /data/productTypes/all - get all records
*/

router.route('/data/productTypes/id/:id')
    .all(tokenValidation)
    .get((request, response, next) => { // get a particular record
        let id = request.params.id;
        let knex = require('knex')(mssqlConfig);
        knex('scheduleSystem.dbo.productType').select('*').where({ id: id }).debug(false)
            .then((resultset) => {
                return response.status(200).json(resultset);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `產品種類資料 [${id}] 讀取發生錯誤: ${error}`)
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
                    `產品種類資料 [${id}] 名稱更新發生錯誤: reference parameter is invalid`)
            );
        } else {
            let knex = require('knex')(mssqlConfig);
            knex('scheduleSystem.dbo.productType').update({ reference: reference }).where({ id: id }).debug(false)
                .then(() => {
                    return response.status(204).end();
                }).catch((error) => {
                    return response.status(500).json(
                        endpointErrorHandler(
                            request.method,
                            request.originalUrl,
                            `產品種類資料 [${id}] 名稱更新發生錯誤: ${error}`)
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
            return trx('scheduleSystem.dbo.productType').select('displaySequence').where({ id: id }).debug(false)
                .then((resultset) => {
                    targetRecordDisplaySequence = resultset[0].displaySequence;
                    // deactivate the target record
                    return trx('scheduleSystem.dbo.productType').update({
                        displaySequence: null,
                        active: 0
                    }).where({ id: id }).debug(false);
                }).then(() => {
                    // update all active records that are preceeded by the target record to displaySequence -1
                    // note: raw query was used due to an issue of getting standard knex query to work
                    return trx.raw('UPDATE scheduleSystem.dbo.productType SET displaySequence=displaySequence-1 WHERE active=1 AND displaySequence>?;', [targetRecordDisplaySequence]).debug(false);
                }).then(() => { // get a fresh set of productType data
                    return trx('scheduleSystem.dbo.productType')
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
                    `產品種類資料 [${id}] 停用發生錯誤: ${error}`)
            );
        }).finally(() => {
            knex.destroy();
        });
    });

router.route('/data/productTypes/id/:id/displaySequence/:displaySequence')
    .all(tokenValidation)
    .patch((request, response, next) => { // reorder active record list
        let id = request.params.id;
        let targetRecordDisplaySequence = null;
        let knex = require('knex')(mssqlConfig);
        knex.transaction((trx) => {
            // get target record's current displaySequence value
            return trx('scheduleSystem.dbo.productType').select('displaySequence').where({ id: id }).debug(false)
                .then((resultset) => {
                    targetRecordDisplaySequence = resultset[0].displaySequence;
                    // check the original and final displaySequence to determine how to reorder
                    if (targetRecordDisplaySequence < request.params.displaySequence) {
                        // adjust displaySequence of all affected active records
                        // note: raw query was used due to an issue of getting standard knex query to work
                        return trx.raw('UPDATE scheduleSystem.dbo.productType SET displaySequence=displaySequence-1 WHERE active=1 AND displaySequence>? AND displaySequence<=?;', [targetRecordDisplaySequence, request.params.displaySequence]).debug(false);
                    } else if (targetRecordDisplaySequence > request.params.displaySequence) {
                        // adjust displaySequence of all affected active records
                        // note: raw query was used due to an issue of getting standard knex query to work
                        return trx.raw('UPDATE scheduleSystem.dbo.productType SET displaySequence=displaySequence+1 WHERE active=1 AND displaySequence>=? AND displaySequence<?;', [request.params.displaySequence, targetRecordDisplaySequence]).debug(false);
                    } else { // original value and target value are the same
                        return Promise.resolve();
                    }
                }).then(() => { // update the target with intended displaySequence
                    if (targetRecordDisplaySequence !== request.params.displaySequenc) {
                        return trx('scheduleSystem.dbo.productType')
                            .update({ displaySequence: request.params.displaySequence })
                            .where({ id: id }).debug(false);
                    } else {
                        return Promise.resolve();
                    }
                }).then(() => { // get a fresh set of productType data
                    return trx('scheduleSystem.dbo.productType')
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
                    `產品種類資料 [${id}] 順序調整發生錯誤: ${error}`)
            );
        }).finally(() => {
            knex.destroy();
        });
    });

router.route('/data/productTypes')
    .all(tokenValidation)
    .get((request, response, next) => { // get all active records
        let knex = require('knex')(mssqlConfig);
        knex('scheduleSystem.dbo.productType')
            .select('*').where({ active: 1, deprecated: null })
            .orderBy('displaySequence').debug(false)
            .then((resultset) => {
                return response.status(200).json(resultset);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `產品種類資料表讀取發生錯誤: ${error}`)
                );
            }).finally(() => {
                knex.destroy();
            });
    })
    .post((request, response, next) => { // insert a new active record to the end of the list
        let knex = require('knex')(mssqlConfig);
        knex.transaction((trx) => {
            return trx('scheduleSystem.dbo.productType').max('displaySequence as maxDisplaySequence').debug(false)
                .then((resultset) => {
                    let recordData = {
                        id: uuidV4().toUpperCase(),
                        reference: request.body.reference,
                        displaySequence: resultset[0].maxDisplaySequence === null ? 0 : resultset[0].maxDisplaySequence + 1,
                        active: 1,
                        deprecated: null
                    };
                    // check if the requested 'reference' is duplicated
                    return trx('scheduleSystem.dbo.productType')
                        .select('*').where({ reference: request.body.reference }).debug(false)
                        .then((resultset) => {
                            if (resultset.length === 0) { // insert new record if no duplicates are found
                                return trx('scheduleSystem.dbo.productType')
                                    .insert(recordData)
                                    .returning(['id', 'reference', 'displaySequence', 'active', 'deprecated'])
                                    .debug(false);
                            } else { // returns the existing record with the same reference
                                return trx('scheduleSystem.dbo.productType')
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
                    `產品種類新增發生錯誤: ${error}`)
            );
        }).finally(() => {
            knex.destroy();
        });
    });

router.route('/data/productTypes/inactive')
    .all(tokenValidation)
    .get((request, response, next) => { // get all inactive but not deprecated records
        let id = request.params.id;
        let knex = require('knex')(mssqlConfig);
        knex('scheduleSystem.dbo.productType').select('*').where({ active: 0, deprecated: null }).debug(false)
            .then((resultset) => {
                return response.status(200).json(resultset);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `產品種類資料 [${id}] 讀取發生錯誤: ${error}`)
                );
            }).finally(() => {
                knex.destroy();
            });
    });

router.route('/data/productTypes/inactive/id/:id')
    .all(tokenValidation)
    .patch((request, response, next) => { // reactivate record
        let id = request.params.id;
        let knex = require('knex')(mssqlConfig);
        knex.transaction((trx) => {
            // get the current highest displaySequence value
            return trx('scheduleSystem.dbo.productType').max('displaySequence as maxDisplaySequence').debug(false)
                .then((resultset) => {
                    return trx('scheduleSystem.dbo.productType').update({
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
                    `產品種類 [${id}] 重新啟用發生錯誤: ${error}`)
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
            return trx('scheduleSystem.dbo.productType')
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
                    `產品種類資料 [${id}] 停用發生錯誤: ${error}`)
            );
        }).finally(() => {
            knex.destroy();
        });
    });

router.route('/data/productTypes/all')
    .all(tokenValidation)
    .get((request, response, next) => { // get all records
        let id = request.params.id;
        let knex = require('knex')(mssqlConfig);
        knex('scheduleSystem.dbo.productType').select('*')
            .orderBy('deprecated').orderBy('active', 'desc').orderBy('displaySequence').debug(false)
            .then((resultset) => {
                return response.status(200).json(resultset);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `產品種類資料 [${id}] 讀取發生錯誤: ${error}`)
                );
            }).finally(() => {
                knex.destroy();
            });
    });

module.exports = router;
