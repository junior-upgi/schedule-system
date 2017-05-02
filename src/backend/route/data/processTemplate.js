import bodyParser from 'body-parser';
import express from 'express';
import uuidV4 from 'uuid/v4';

import { endpointErrorHandler } from '../../utility/endpointErrorHandler.js';
import { mssqlConfig } from '../../config/mssqlServer.js';
import { currentDatetimeString } from '../../utility/timeUtility.js';
import tokenValidation from '../../middleware/tokenValidation.js';

const router = express.Router();
router.use(bodyParser.json());

const routePath = '/data/processTemplates';
const dataTable = 'scheduleSystem.dbo.processTemplate';
const errorRef = '工序範本資料';
const debugFlag = false;

/* // route definitions

get /data/processTemplates/id/:id - get a single record by 'id'
patch /data/processTemplates/id/:id - update the 'reference' field value of a record
delete /data/processTemplates/id/:id - deactivate an active record and reorder

patch /data/processTemplates/id/:id/displaySequence/:displaySequence - reorder active record list

get /data/processTemplates - get all active records
post /data/processTemplates - add new records to the end of list

get /data/processTemplates/inactive - get all inactive but not deprecated records

patch /data/processTemplates/inactive/id/:id - activate a record and place at the end of list (assuming record isn't deprecated)
delete /data/processTemplates/inactive/id/:id - deprecate an inactive record

get /data/processTemplates/deprecated - get all deprecated records

get /data/processTemplates/all - get all records
*/

router.route(`${routePath}/id/:id`)
    .all(tokenValidation)
    // get a single record by 'id'
    .get((request, response, next) => {
        let id = request.params.id;
        let knex = require('knex')(mssqlConfig);
        knex(dataTable)
            .select('*')
            .where({ id: id })
            .debug(debugFlag)
            .then((resultset) => {
                return response.status(200).json(resultset);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `${errorRef} [${id}] 讀取發生錯誤: ${error}`)
                );
            }).finally(() => {
                knex.destroy();
            });
    })
    // update the 'reference' field value of a record
    .patch((request, response, next) => {
        let id = request.params.id;
        let reference = request.body.reference;
        // check if the request has valid data
        if (
            (reference === undefined) ||
            (reference === null) ||
            (reference === '')) {
            return response.status(400).json(
                endpointErrorHandler(
                    request.method,
                    request.originalUrl,
                    `${errorRef} [${id}] 名稱更新發生錯誤: reference parameter is invalid`)
            );
        } else {
            let knex = require('knex')(mssqlConfig);
            knex(dataTable)
                .update({ reference: reference })
                .where({ id: id })
                .debug(debugFlag)
                .then(() => {
                    return response.status(204).end();
                }).catch((error) => {
                    return response.status(500).json(
                        endpointErrorHandler(
                            request.method,
                            request.originalUrl,
                            `${errorRef} [${id}] 名稱更新發生錯誤: ${error}`)
                    );
                }).finally(() => {
                    knex.destroy();
                });
        }
    })
    // deactivate an active record and reorder
    .delete((request, response, next) => {
        let id = request.params.id;
        let targetRecordDisplaySequence = null;
        let knex = require('knex')(mssqlConfig);
        knex.transaction((trx) => {
            // get target record's current data
            return trx(dataTable)
                .select('displaySequence')
                .where({ id: id })
                .debug(debugFlag)
                .then((resultset) => {
                    targetRecordDisplaySequence = resultset[0].displaySequence;
                    // deactivate the target record
                    return trx(dataTable)
                        .update({ displaySequence: null, active: 0 })
                        .where({ id: id, active: 1 })
                        .whereNull('deprecated')
                        .debug(debugFlag)
                        .returning(['id']);
                }).then(() => {
                    // update all active records that are preceeded by the target record to displaySequence -1
                    return trx(dataTable)
                        .decrement('displaySequence', 1)
                        .where({ active: 1 })
                        .where('displaySequence', '>', targetRecordDisplaySequence)
                        .debug(debugFlag);
                }).then(() => {
                    // get a fresh set of data
                    return trx(dataTable)
                        .select('*')
                        .whereNull('deprecated')
                        .orderBy('active', 'desc')
                        .orderBy('displaySequence')
                        .orderBy('reference')
                        .debug(debugFlag);
                });
        }).then((resultset) => {
            return response.status(200).json(resultset);
        }).catch((error) => {
            return response.status(500).json(
                endpointErrorHandler(
                    request.method,
                    request.originalUrl,
                    `${errorRef} [${id}] 停用發生錯誤: ${error}`)
            );
        }).finally(() => {
            knex.destroy();
        });
    });

router.route(`${routePath}/id/:id/displaySequence/:displaySequence`)
    .all(tokenValidation)
    // reorder active record list
    .patch((request, response, next) => {
        let id = request.params.id;
        let originalSeqValue = null;
        let intendedSeqValue = request.params.displaySequence;
        let upperLimit = null;
        let knex = require('knex')(mssqlConfig);
        knex.transaction((trx) => {
            // get target record's current displaySequence value
            return trx(dataTable)
                .select('displaySequence')
                .where({ id: id })
                .debug(debugFlag)
                .then((resultset) => {
                    originalSeqValue = resultset[0].displaySequence;
                    // get the current highest displaySequence value
                    return trx(dataTable)
                        .max('displaySequence as maxDisplaySequence')
                        .debug(debugFlag);
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
                                .debug(debugFlag);
                        } else { // adjust displaySequence of all affected active records
                            return trx(dataTable)
                                .increment('displaySequence', 1)
                                .where({ active: 1 })
                                .where('displaySequence', '>=', intendedSeqValue)
                                .where('displaySequence', '<', originalSeqValue)
                                .debug(debugFlag);
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
                            .where({ id: id })
                            .debug(debugFlag);
                    }
                }).then(() => { // get a fresh set of data
                    return trx(dataTable)
                        .select('*')
                        .where({ active: 1, deprecated: null })
                        .orderBy('displaySequence')
                        .debug(debugFlag);
                });
        }).then((resultset) => {
            return response.status(200).json(resultset);
        }).catch((error) => {
            return response.status(500).json(
                endpointErrorHandler(
                    request.method,
                    request.originalUrl,
                    `${errorRef} [${id}] 順序調整發生錯誤: ${error}`)
            );
        }).finally(() => {
            knex.destroy();
        });
    });

router.route(`${routePath}`)
    .all(tokenValidation)
    // get all active records
    .get((request, response, next) => {
        let knex = require('knex')(mssqlConfig);
        knex(dataTable)
            .select('*')
            .where({ active: 1, deprecated: null })
            .orderBy('displaySequence')
            .debug(debugFlag)
            .then((resultset) => {
                return response.status(200).json(resultset);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `${errorRef}表讀取發生錯誤: ${error}`)
                );
            }).finally(() => {
                knex.destroy();
            });
    })
    // insert a new active record to the end of the list
    .post((request, response, next) => {
        let knex = require('knex')(mssqlConfig);
        knex.transaction((trx) => {
            // get the current highest displaySequence value
            return trx(dataTable)
                .max('displaySequence as maxDisplaySequence')
                .debug(debugFlag)
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
                        .select('*')
                        .where({ reference: request.body.reference })
                        .debug(debugFlag)
                        .then((resultset) => {
                            if (resultset.length === 0) { // insert new record if no duplicates are found
                                return trx(dataTable)
                                    .insert(recordData)
                                    .returning(['id', 'reference', 'displaySequence', 'active', 'deprecated'])
                                    .debug(debugFlag);
                            } else { // returns the existing record with the same reference
                                return trx(dataTable)
                                    .select('*')
                                    .where({ reference: request.body.reference })
                                    .debug(debugFlag);
                            }
                        });
                });
        }).then((resultset) => {
            return response.status(201).json(resultset[0]);
        }).catch((error) => {
            return response.status(500).json(
                endpointErrorHandler(
                    request.method,
                    request.originalUrl,
                    `${errorRef}新增發生錯誤: ${error}`)
            );
        }).finally(() => {
            knex.destroy();
        });
    });

router.route(`${routePath}/inactive`)
    .all(tokenValidation)
    // get all inactive but not deprecated records
    .get((request, response, next) => {
        let id = request.params.id;
        let knex = require('knex')(mssqlConfig);
        knex(dataTable)
            .select('*')
            .where({ active: 0, deprecated: null })
            .debug(debugFlag)
            .then((resultset) => {
                return response.status(200).json(resultset);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `${errorRef}(停用中) [${id}] 讀取發生錯誤: ${error}`)
                );
            }).finally(() => {
                knex.destroy();
            });
    });

router.route(`${routePath}/inactive/id/:id`)
    .all(tokenValidation)
    // activate an inactive record
    .patch((request, response, next) => {
        let id = request.params.id;
        let knex = require('knex')(mssqlConfig);
        knex.transaction((trx) => {
            // get the current highest displaySequence value
            return trx(dataTable)
                .max('displaySequence as maxDisplaySequence')
                .debug(debugFlag)
                .then((resultset) => {
                    return trx(dataTable)
                        .update({
                            displaySequence: resultset[0].maxDisplaySequence === null ? 0 : resultset[0].maxDisplaySequence + 1,
                            active: 1,
                            deprecated: null
                        }).where({ id: id, active: 0 })
                        .returning(['id', 'reference', 'displaySequence', 'active', 'deprecated'])
                        .debug(debugFlag);
                });
        }).then((resultset) => {
            return response.status(200).json(resultset[0]);
        }).catch((error) => {
            return response.status(500).json(
                endpointErrorHandler(
                    request.method,
                    request.originalUrl,
                    `${errorRef} [${id}] 重新啟用發生錯誤: ${error}`)
            );
        }).finally(() => {
            knex.destroy();
        });
    })
    // deprecate an inactive record
    .delete((request, response, next) => {
        let id = request.params.id;
        let deprecatedFieldValue = {
            displaySequence: null,
            deprecated: currentDatetimeString()
        };
        let knex = require('knex')(mssqlConfig);
        knex.transaction((trx) => {
            return trx(dataTable) // deprecate the target record
                .update(deprecatedFieldValue)
                .where({ id: id, active: 0 })
                .debug(debugFlag);
        }).then(() => {
            return response.status(204).end();
        }).catch((error) => {
            return response.status(500).json(
                endpointErrorHandler(
                    request.method,
                    request.originalUrl,
                    `${errorRef} [${id}] 停用發生錯誤: ${error}`)
            );
        }).finally(() => {
            knex.destroy();
        });
    });

router.route(`${routePath}/deprecated`)
    .all(tokenValidation)
    // get all deprecated records
    .get((request, response, next) => {
        let id = request.params.id;
        let knex = require('knex')(mssqlConfig);
        knex(dataTable)
            .select('*')
            .whereNotNull('deprecated')
            .orderBy('reference')
            .debug(debugFlag)
            .then((resultset) => {
                return response.status(200).json(resultset);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `${errorRef}(刪除資料項目) [${id}] 讀取發生錯誤: ${error}`)
                );
            }).finally(() => {
                knex.destroy();
            });
    });

router.route(`${routePath}/all`)
    .all(tokenValidation)
    // get all records
    .get((request, response, next) => {
        let id = request.params.id;
        let knex = require('knex')(mssqlConfig);
        knex(dataTable).select('*')
            .orderBy('deprecated')
            .orderBy('active', 'desc')
            .orderBy('displaySequence')
            .debug(debugFlag)
            .then((resultset) => {
                return response.status(200).json(resultset);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `${errorRef}(所有項目) [${id}] 讀取發生錯誤: ${error}`)
                );
            }).finally(() => {
                knex.destroy();
            });
    });

module.exports = router;
