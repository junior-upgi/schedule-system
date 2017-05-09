import bodyParser from 'body-parser';
import express from 'express';

import { endpointErrorHandler } from '../../utilities/endpointErrorHandler.js';
import { currentDatetimeString } from '../../utilities/timeRelated.js';
import tokenValidation from '../../middlewares/tokenValidation.js';

import JobTemplates from '../../models/jobTemplates.js';
import JobTypes from '../../models/jobTypes.js';
import Phases from '../../models/phases.js';
import ProcessStates from '../../models/processStates.js';
import ProcessTypes from '../../models/processTypes.js';
import ProductTypes from '../../models/productTypes.js';

const router = express.Router();
router.use(bodyParser.json());

const referenceTables = [{
    dataModel: JobTemplates,
    dataRef: 'jobTemplates',
    routePath: '/data/jobTemplates',
    name: 'scheduleSystem.dbo.jobTemplates',
    errorRef: '工序範本資料'
}, {
    dataModel: JobTypes,
    dataRef: 'jobTypes',
    routePath: '/data/jobTypes',
    name: 'scheduleSystem.dbo.jobTypes',
    errorRef: '工作類別資料'
}, {
    dataModel: Phases,
    dataRef: 'phases',
    routePath: '/data/phases',
    name: 'scheduleSystem.dbo.phases',
    errorRef: '工作階段資料'
}, {
    dataModel: ProcessStates,
    dataRef: 'processStates',
    routePath: '/data/processStates',
    name: 'scheduleSystem.dbo.processStates',
    errorRef: '工序狀態資料'
}, {
    dataModel: ProcessTypes,
    dataRef: 'processTypes',
    routePath: '/data/processTypes',
    name: 'scheduleSystem.dbo.processTypes',
    errorRef: '工序類別資料'
}, {
    dataModel: ProductTypes,
    dataRef: 'productTypes',
    routePath: '/data/productTypes',
    name: 'scheduleSystem.dbo.productTypes',
    errorRef: '產品類別資料'
}];

referenceTables.forEach((referenceTable) => {
    router.route(`${referenceTable.routePath}`)
        .all(tokenValidation)
        // insert new record
        .post((request, response, next) => {
            let objection = require('objection');
            let dataModel = referenceTable.dataModel;
            let reference = request.body.reference;
            objection.transaction(dataModel, (dataModel) => {
                let checkDuplicateQuery = dataModel.query().where({ reference: reference });
                let getMaxDisplaySequence = dataModel.query().max('displaySequence AS maxDisplaySequence');
                return Promise.all([checkDuplicateQuery, getMaxDisplaySequence])
                    .then((resultsets) => {
                        if (resultsets[0].length === 0) {
                            return dataModel.query()
                                .insertAndFetch({
                                    reference: reference,
                                    displaySequence: resultsets[1][0].maxDisplaySequence + 1
                                });
                        } else {
                            return Promise.resolve(resultsets[0]);
                        }
                    });
            }).then((resultset) => {
                return response.status(201).json(resultset);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `${referenceTable.errorRef}新增發生錯誤: ${error}`)
                );
            });
        });

    router.route(`${referenceTable.routePath}/active`)
        .all(tokenValidation)
        // get active recordset
        .get((request, response, next) => {
            referenceTable.dataModel.query()
                .where({ active: true, deletedAt: null })
                .whereNotNull('displaySequence')
                .orderBy('reference')
                .then((resultset) => {
                    return response.status(200).json(resultset);
                }).catch((error) => {
                    return response.status(500).json(
                        endpointErrorHandler(
                            request.method,
                            request.originalUrl,
                            `${referenceTable.errorRef}(啟用項目)讀取發生錯誤: ${error}`)
                    );
                });
        });

    router.route(`${referenceTable.routePath}/active/id/:id`)
        .all(tokenValidation)
        // get an 'active' record by 'id'
        .get((request, response, next) => {
            let id = request.params.id;
            referenceTable.dataModel.query()
                .where({ id: id, active: true, deletedAt: null })
                .whereNotNull('displaySequence')
                .then((resultset) => {
                    console.log(resultset);
                    if (resultset.length === 0) {
                        return response.status(200).send({});
                    } else {
                        return response.status(200).json(resultset[0]);
                    }
                }).catch((error) => {
                    return response.status(response.statusCode).json(
                        endpointErrorHandler(
                            request.method,
                            request.originalUrl,
                            `${referenceTable.errorRef} [${id}] 讀取發生錯誤: ${error}`)
                    );
                });
        })
        // update 'reference' field an 'active' record by id
        .patch((request, response, next) => {
            let id = request.params.id;
            let reference = request.body.reference;
            // check if the request has valid data
            if (
                (reference === undefined) ||
                (reference === null) ||
                (reference === '')
            ) {
                return response.status(400).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `${referenceTable.errorRef} [${id}] 名稱更新發生錯誤: reference parameter is invalid`)
                );
            } else {
                let objection = require('objection');
                let dataModel = referenceTable.dataModel;
                objection.transaction(dataModel, (dataModel) => {
                    return dataModel.query().where({ reference: reference })
                        .then((resultset) => {
                            if (resultset.length === 0) {
                                return dataModel.query()
                                    .patchAndFetchById(id, {
                                        reference: reference,
                                        updatedAt: currentDatetimeString()
                                    });
                            } else {
                                return Promise.resolve(resultset);
                            }
                        });
                }).then((resultset) => {
                    let responseObject = {};
                    responseObject[referenceTable.dataRef] = resultset;
                    return response.status(201).json(responseObject);
                }).catch((error) => {
                    return response.status(500).json(
                        endpointErrorHandler(
                            request.method,
                            request.originalUrl,
                            `${referenceTable.errorRef} [${id}] 名稱更新發生錯誤: ${error}`)
                    );
                });
            }
        })
        // deactivate an 'active' record by 'id' and resequence accordingly
        .delete((request, response, next) => {
            let objection = require('objection');
            let dataModel = referenceTable.dataModel;
            let id = request.params.id;
            let targetRecordDisplaySequence = null;
            objection.transaction(dataModel, (dataModel) => {
                // get target record's current data
                return dataModel.query().where({ id: id, active: true })
                    .then((resultset) => {
                        if (resultset.length === 1) { // act only if only one record is valid to deactivate
                            targetRecordDisplaySequence = resultset[0].displaySequence;
                            // deactivate the target record
                            let deactivateQuery = dataModel.query()
                                .patch({
                                    displaySequence: null,
                                    active: false,
                                    updatedAt: currentDatetimeString()
                                })
                                .where({ id: id, active: 1 });
                            // update 'displaySequence' of records preceeded by target record
                            let resequenceQuery = dataModel.query()
                                .decrement('displaySequence', 1)
                                .where({ active: true })
                                .whereNot({ id: id })
                                .where('displaySequence', '>', targetRecordDisplaySequence);
                            // update 'updatedAt' of records preceeded by target record
                            let markUpdateQuery = dataModel.query()
                                .patch({ updatedAt: currentDatetimeString() })
                                .where({ active: true })
                                .whereNot({ id: id })
                                .where('displaySequence', '>', targetRecordDisplaySequence);
                            return Promise.all([deactivateQuery, resequenceQuery, markUpdateQuery]);
                        } else { // no valid record is found
                            return Promise.resolve();
                        }
                    }).then(() => {
                        return dataModel.query();
                    });
            }).then((resultset) => {
                let responseObject = {};
                responseObject[referenceTable.dataRef] = resultset;
                return response.status(201).json(responseObject);
            }).catch((error) => {
                return response.status(500).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `${referenceTable.errorRef} [${id}] 停用發生錯誤: ${error}`)
                );
            });
        });

    router.route(`${referenceTable.routePath}/active/id/:id/displaySequence/:displaySequence`)
        .all(tokenValidation)
        // reorder active record list
        .patch((request, response, next) => {
            let objection = require('objection');
            let dataModel = referenceTable.dataModel;
            let id = request.params.id; // id of target record
            let originalSeqValue = null; // original displaySequence of target record
            let intendedSeqValue = request.params.displaySequence; // destination displaySequence
            let upperLimit = null; // allowed limit to set as displaySequence
            objection.transaction(dataModel, (dataModel) => {
                // get the original displaySequence of the target record
                let getOriginalSeqValueQuery = dataModel.query().where({ id: id, active: true });
                // get the highest displaySequence value
                let getUpperLimitQuery = dataModel.query().max('displaySequence as maxDisplaySequence');
                return Promise.all([getOriginalSeqValueQuery, getUpperLimitQuery])
                    .then((resultsets) => {
                        originalSeqValue = resultsets[0][0].displaySequence;
                        upperLimit = resultsets[1][0].maxDisplaySequence;
                        if ( // check if invalid conditions existed
                            (resultsets[0][0] !== undefined) &&
                            (resultsets[0][0].displaySequence !== intendedSeqValue) &&
                            (resultsets[1][0] !== undefined) &&
                            (upperLimit >= intendedSeqValue)
                        ) {
                            // adjust display sequence of the target record
                            let adjustTargetRecordSequence = dataModel.query().patchAndFetchById(id, { displaySequence: intendedSeqValue });
                            let adjustRelatedRecordSequence = null;
                            if (originalSeqValue < intendedSeqValue) { // decrease displaySequence of related records accordingly
                                adjustRelatedRecordSequence = dataModel.query()
                                    .decrement('displaySequence', 1)
                                    .whereNot({ active: false, id: id, deletedAt: null })
                                    .where('displaySequence', '>', originalSeqValue)
                                    .where('displaySequence', '<=', intendedSeqValue);
                            } else { // increase displaySequence or related records according
                                adjustRelatedRecordSequence = dataModel.query()
                                    .increment('displaySequence', 1)
                                    .whereNot({ active: false, id: id, deletedAt: null })
                                    .where('displaySequence', '>=', intendedSeqValue)
                                    .where('displaySequence', '<', originalSeqValue);
                            }
                            return Promise.all([adjustTargetRecordSequence, adjustRelatedRecordSequence]);
                        } else { // request error, reject the promise chain
                            if (resultsets[0][0] === undefined) {
                                response.status(400);
                                return Promise.reject('target record lookup error');
                            } else if (resultsets[0][0] === intendedSeqValue) {
                                response.status(405);
                                return Promise.reject('original position and destination are the same');
                            } else if (resultsets[1][0] === undefined) {
                                response.status(500);
                                return Promise.reject('upper limit lookup error');
                            } else if (upperLimit < intendedSeqValue) {
                                response.status(405);
                                return Promise.reject('destination is over upper limit');
                            } else {
                                response.status(500);
                                return Promise.reject('unexpected error');
                            }
                        }
                    }).then((resultsets) => {
                        console.log(resultsets[0]);
                        return dataModel.query()
                            .where({ active: true, deletedAt: null })
                            .whereNotNull('displaySequence')
                            .orderBy('displaySequence');
                    });
            }).then((resultset) => {
                let responseObject = {};
                responseObject[referenceTable.dataRef] = resultset;
                return response.status(201).json(responseObject);
            }).catch((error) => {
                return response.status(response.statusCode).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `${referenceTable.errorRef} [${id}] 順序調整發生錯誤: ${error}`)
                );
            });
        });

    router.route(`${referenceTable.routePath}/all`)
        .all(tokenValidation)
        // get all records
        .get((request, response, next) => {
            referenceTable.dataModel.query()
                .orderBy('active', 'desc')
                .orderBy('deletedAt')
                .orderBy('displaySequence')
                .orderBy('reference')
                .then((resultset) => {
                    return response.status(200).json(resultset);
                }).catch((error) => {
                    return response.status(500).json(
                        endpointErrorHandler(
                            request.method,
                            request.originalUrl,
                            `${referenceTable.errorRef}(所有項目)讀取發生錯誤: ${error}`)
                    );
                });
        });

    router.route(`${referenceTable.routePath}/deleted`)
        .all(tokenValidation)
        // get all deleted records
        .get((request, response, next) => {
            referenceTable.dataModel.query()
                .where({ active: false })
                .whereNull('displaySequence')
                .whereNotNull('deletedAt')
                .orderBy('reference')
                .then((resultset) => {
                    return response.status(200).json(resultset);
                }).catch((error) => {
                    return response.status(500).json(
                        endpointErrorHandler(
                            request.method,
                            request.originalUrl,
                            `${referenceTable.errorRef}(刪除項目)讀取發生錯誤: ${error}`)
                    );
                });
        });

    router.route(`${referenceTable.routePath}/id/:id`)
        .all(tokenValidation)
        // get a record of any state by 'id'
        .get((request, response, next) => {
            let id = request.params.id;
            referenceTable.dataModel.query()
                .where({ id: id })
                .then((resultset) => {
                    return response.status(200).json(resultset[0]);
                }).catch((error) => {
                    return response.status(500).json(
                        endpointErrorHandler(
                            request.method,
                            request.originalUrl,
                            `${referenceTable.errorRef} [${id}] 讀取發生錯誤: ${error}`)
                    );
                });
        });

    router.route(`${referenceTable.routePath}/inactive`)
        .all(tokenValidation)
        // get all inactive but not deprecated records
        .get((request, response, next) => {
            referenceTable.dataModel.query()
                .where({ active: false, deletedAt: null })
                .whereNull('displaySequence')
                .orderBy('reference')
                .then((resultset) => {
                    return response.status(200).json(resultset);
                }).catch((error) => {
                    return response.status(response.statusCode).json(
                        endpointErrorHandler(
                            request.method,
                            request.originalUrl,
                            `${referenceTable.errorRef}(停用項目)讀取發生錯誤: ${error}`)
                    );
                });
        });

    router.route(`${referenceTable.routePath}/inactive/id/:id`)
        .all(tokenValidation)
        // reactivate an inactive record and place at the end of the list
        .patch((request, response, next) => {
            let objection = require('objection');
            let dataModel = referenceTable.dataModel;
            let id = request.params.id;
            objection.transaction(dataModel, (dataModel) => {
                return dataModel.query()
                    .max('displaySequence AS maxDisplaySequence')
                    .then((resultset) => {
                        return dataModel.query()
                            .patchAndFetchById(id, {
                                displaySequence: resultset[0].maxDisplaySequence === null ? 0 : resultset[0].maxDisplaySequence + 1,
                                active: true
                            }).where({ active: false, deletedAt: null });
                    });
            }).then((resultset) => {
                if (resultset) {
                    return response.status(200).json(resultset);
                } else {
                    response.status(400);
                    return Promise.reject(`no inactive record by the id of [${id}]`);
                }
            }).catch((error) => {
                return response.status(response.statusCode).json(
                    endpointErrorHandler(
                        request.method,
                        request.originalUrl,
                        `${referenceTable.errorRef} [${id}] 重新啟用發生錯誤: ${error}`)
                );
            });
        })
        // mark an 'inactive' record as 'deleted'
        .delete((request, response, next) => {
            let id = request.params.id;
            referenceTable.dataModel.query()
                .patchAndFetchById(id, {
                    updatedAt: currentDatetimeString(),
                    deletedAt: currentDatetimeString()
                }).where({
                    displaySequence: null,
                    active: false,
                    deletedAt: null
                }).then((resultset) => {
                    // check if a valid record was found
                    if ((resultset !== undefined) && (resultset !== null)) { // found valid record to delete
                        let responseObject = {};
                        responseObject[referenceTable.dataRef] = [resultset];
                        return response.status(201).json(responseObject);
                    } else { // no record was deleted
                        response.status(400);
                        return Promise.reject(`no inactive record by the id of [${id}]`);
                    }
                }).catch((error) => {
                    return response.status(response.statusCode).json(
                        endpointErrorHandler(
                            request.method,
                            request.originalUrl,
                            `${referenceTable.errorRef} [${id}] 永遠停用發生錯誤: ${error}`)
                    );
                });
        });
});

module.exports = router;
