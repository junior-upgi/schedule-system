import bodyParser from 'body-parser';
import express from 'express';
import uuidV4 from 'uuid/v4';

import { endpointErrorHandler } from '../../utilities/endpointErrorHandler.js';
import { dbConfig } from '../../config/database.js';
import { currentDatetimeString } from '../../utilities/timeRelated.js';
import tokenValidation from '../../middlewares/tokenValidation.js';

const router = express.Router();
router.use(bodyParser.json());

const referenceTables = [{
    dataRef: 'jobTypes',
    routePath: '/data/jobTypes',
    name: 'scheduleSystem.dbo.jobTypes',
    errorRef: '工作類別資料'
}, {
    dataRef: 'phases',
    routePath: '/data/phases',
    name: 'scheduleSystem.dbo.phases',
    errorRef: '工作階段資料'
}, {
    dataRef: 'processStates',
    routePath: '/data/processStates',
    name: 'scheduleSystem.dbo.processStates',
    errorRef: '工序狀態資料'
}, {
    dataRef: 'processTemplates',
    routePath: '/data/processTemplates',
    name: 'scheduleSystem.dbo.processTemplates',
    errorRef: '工序範本資料'
}, {
    dataRef: 'processTypes',
    routePath: '/data/processTypes',
    name: 'scheduleSystem.dbo.processTypes',
    errorRef: '工序類別資料'
}, {
    dataRef: 'productTypes',
    routePath: '/data/productTypes',
    name: 'scheduleSystem.dbo.productTypes',
    errorRef: '產品類別資料'
}];

referenceTables.forEach((referenceTable) => {
    router.route(`${referenceTable.routePath}/id/:id`)
        .all(tokenValidation)
        // get a single record by 'id'
        .get((request, response, next) => {
            let id = request.params.id;
            let knex = require('knex')(dbConfig);
            knex(referenceTable.name)
                .select('*')
                .where({ id: id })
                .then((resultset) => {
                    return response.status(200).json(resultset);
                }).catch((error) => {
                    return response.status(500).json(
                        endpointErrorHandler(
                            request.method,
                            request.originalUrl,
                            `${referenceTable.errorRef} [${id}] 讀取發生錯誤: ${error}`)
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
                        `${referenceTable.errorRef} [${id}] 名稱更新發生錯誤: reference parameter is invalid`)
                );
            } else {
                let knex = require('knex')(dbConfig);
                knex(referenceTable.name)
                    .update({ reference: reference })
                    .where({ id: id })
                    .then(() => {
                        return response.status(204).end();
                    }).catch((error) => {
                        return response.status(500).json(
                            endpointErrorHandler(
                                request.method,
                                request.originalUrl,
                                `${referenceTable.errorRef} [${id}] 名稱更新發生錯誤: ${error}`)
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
            let knex = require('knex')(dbConfig);
            knex.transaction((trx) => {
                // get target record's current data
                return trx(referenceTable.name)
                    .select('displaySequence')
                    .where({ id: id })
                    .then((resultset) => {
                        targetRecordDisplaySequence = resultset[0].displaySequence;
                        // deactivate the target record
                        return trx(referenceTable.name)
                            .update({ displaySequence: null, active: 0 })
                            .where({ id: id, active: 1 })
                            .whereNull('deprecated')
                            .returning(['id']);
                    }).then(() => {
                        // update all active records that are preceeded by the target record to displaySequence -1
                        return trx(referenceTable.name)
                            .decrement('displaySequence', 1)
                            .where({ active: 1 })
                            .where('displaySequence', '>', targetRecordDisplaySequence);
                    }).then(() => {
                        // get a fresh set of data
                        return trx(referenceTable.name)
                            .select('*')
                            .whereNull('deprecated')
                            .orderBy('active', 'desc')
                            .orderBy('displaySequence')
                            .orderBy('reference');
                    });
            }).then((resultset) => {
                return response.status(200).json(resultset);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `${referenceTable.errorRef} [${id}] 停用發生錯誤: ${error}`)
                );
            }).finally(() => {
                knex.destroy();
            });
        });

    router.route(`${referenceTable.routePath}/id/:id/displaySequence/:displaySequence`)
        .all(tokenValidation)
        // reorder active record list
        .patch((request, response, next) => {
            let id = request.params.id;
            let originalSeqValue = null;
            let intendedSeqValue = request.params.displaySequence;
            let upperLimit = null;
            let knex = require('knex')(dbConfig);
            knex.transaction((trx) => {
                // get target record's current displaySequence value
                return trx(referenceTable.name)
                    .select('displaySequence')
                    .where({ id: id })
                    .then((resultset) => {
                        originalSeqValue = resultset[0].displaySequence;
                        // get the current highest displaySequence value
                        return trx(referenceTable.name)
                            .max('displaySequence as maxDisplaySequence');
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
                                return trx(referenceTable.name)
                                    .decrement('displaySequence', 1)
                                    .where({ active: 1 })
                                    .where('displaySequence', '>', originalSeqValue)
                                    .where('displaySequence', '<=', intendedSeqValue);
                            } else { // adjust displaySequence of all affected active records
                                return trx(referenceTable.name)
                                    .increment('displaySequence', 1)
                                    .where({ active: 1 })
                                    .where('displaySequence', '>=', intendedSeqValue)
                                    .where('displaySequence', '<', originalSeqValue);
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
                            return trx(referenceTable.name)
                                .update({ displaySequence: intendedSeqValue })
                                .where({ id: id });
                        }
                    }).then(() => { // get a fresh set of data
                        return trx(referenceTable.name)
                            .select('*')
                            .where({ active: 1, deprecated: null })
                            .orderBy('displaySequence');
                    });
            }).then((resultset) => {
                return response.status(200).json(resultset);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `${referenceTable.errorRef} [${id}] 順序調整發生錯誤: ${error}`)
                );
            }).finally(() => {
                knex.destroy();
            });
        });

    router.route(`${referenceTable.routePath}`)
        .all(tokenValidation)
        // get all active records
        .get((request, response, next) => {
            let knex = require('knex')(dbConfig);
            knex(referenceTable.name)
                .select('*')
                .where({ active: 1, deprecated: null })
                .orderBy('displaySequence')
                .then((resultset) => {
                    return response.status(200).json(resultset);
                }).catch((error) => {
                    return response.status(500).json(
                        endpointErrorHandler(
                            request.method,
                            request.originalUrl,
                            `${referenceTable.errorRef}表讀取發生錯誤: ${error}`)
                    );
                }).finally(() => {
                    knex.destroy();
                });
        })
        // insert a new active record to the end of the list
        .post((request, response, next) => {
            let knex = require('knex')(dbConfig);
            knex.transaction((trx) => {
                // get the current highest displaySequence value
                return trx(referenceTable.name)
                    .max('displaySequence as maxDisplaySequence')
                    .then((resultset) => {
                        let recordData = {
                            id: uuidV4().toUpperCase(),
                            reference: request.body.reference,
                            displaySequence: resultset[0].maxDisplaySequence === null ? 0 : resultset[0].maxDisplaySequence + 1,
                            active: 1,
                            deprecated: null
                        };
                        // check if the requested 'reference' is duplicated
                        return trx(referenceTable.name)
                            .select('*')
                            .where({ reference: request.body.reference })
                            .then((resultset) => {
                                if (resultset.length === 0) { // insert new record if no duplicates are found
                                    return trx(referenceTable.name)
                                        .insert(recordData)
                                        .returning(['id', 'reference', 'displaySequence', 'active', 'deprecated']);
                                } else { // returns the existing record with the same reference
                                    return trx(referenceTable.name)
                                        .select('*')
                                        .where({ reference: request.body.reference });
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
                        `${referenceTable.errorRef}新增發生錯誤: ${error}`)
                );
            }).finally(() => {
                knex.destroy();
            });
        });

    router.route(`${referenceTable.routePath}/inactive`)
        .all(tokenValidation)
        // get all inactive but not deprecated records
        .get((request, response, next) => {
            let id = request.params.id;
            let knex = require('knex')(dbConfig);
            knex(referenceTable.name)
                .select('*')
                .where({ active: 0, deprecated: null })
                .then((resultset) => {
                    return response.status(200).json(resultset);
                }).catch((error) => {
                    return response.status(500).json(
                        endpointErrorHandler(
                            request.method,
                            request.originalUrl,
                            `${referenceTable.errorRef}(停用中) [${id}] 讀取發生錯誤: ${error}`)
                    );
                }).finally(() => {
                    knex.destroy();
                });
        });

    router.route(`${referenceTable.routePath}/inactive/id/:id`)
        .all(tokenValidation)
        // activate an inactive record and place at the end of the list
        .patch((request, response, next) => {
            let id = request.params.id;
            let knex = require('knex')(dbConfig);
            knex.transaction((trx) => {
                // get the current highest displaySequence value
                return trx(referenceTable.name)
                    .max('displaySequence as maxDisplaySequence')
                    .then((resultset) => {
                        return trx(referenceTable.name)
                            .update({
                                displaySequence: resultset[0].maxDisplaySequence === null ? 0 : resultset[0].maxDisplaySequence + 1,
                                active: 1,
                                deprecated: null
                            }).where({ id: id, active: 0 })
                            .returning(['id', 'reference', 'displaySequence', 'active', 'deprecated']);
                    });
            }).then((resultset) => {
                return response.status(200).json(resultset[0]);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `${referenceTable.errorRef} [${id}] 重新啟用發生錯誤: ${error}`)
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
            let knex = require('knex')(dbConfig);
            knex.transaction((trx) => {
                return trx(referenceTable.name) // deprecate the target record
                    .update(deprecatedFieldValue)
                    .where({ id: id, active: 0 });
            }).then(() => {
                return response.status(204).end();
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `${referenceTable.errorRef} [${id}] 停用發生錯誤: ${error}`)
                );
            }).finally(() => {
                knex.destroy();
            });
        });

    router.route(`${referenceTable.routePath}/deprecated`)
        .all(tokenValidation)
        // get all deprecated records
        .get((request, response, next) => {
            let id = request.params.id;
            let knex = require('knex')(dbConfig);
            knex(referenceTable.name)
                .select('*')
                .whereNotNull('deprecated')
                .orderBy('reference')
                .then((resultset) => {
                    return response.status(200).json(resultset);
                }).catch((error) => {
                    return response.status(500).json(
                        endpointErrorHandler(
                            request.method,
                            request.originalUrl,
                            `${referenceTable.errorRef}(刪除資料項目) [${id}] 讀取發生錯誤: ${error}`)
                    );
                }).finally(() => {
                    knex.destroy();
                });
        });

    router.route(`${referenceTable.routePath}/all`)
        .all(tokenValidation)
        // get all records
        .get((request, response, next) => {
            let id = request.params.id;
            let knex = require('knex')(dbConfig);
            knex(referenceTable.name).select('*')
                .orderBy('deprecated')
                .orderBy('active', 'desc')
                .orderBy('displaySequence')
                .then((resultset) => {
                    return response.status(200).json(resultset);
                }).catch((error) => {
                    return response.status(500).json(
                        endpointErrorHandler(
                            request.method,
                            request.originalUrl,
                            `${referenceTable.errorRef}(所有項目) [${id}] 讀取發生錯誤: ${error}`)
                    );
                }).finally(() => {
                    knex.destroy();
                });
        });
});

module.exports = router;
