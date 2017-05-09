import express from 'express';

import { endpointErrorHandler } from '../../utilities/endpointErrorHandler.js';
import tokenValidation from '../../middlewares/tokenValidation.js';

import JobTemplates from '../../models/jobTemplates.js';
import JobTypes from '../../models/jobTypes.js';
import Phases from '../../models/phases.js';
import ProcessStates from '../../models/processStates.js';
import ProcessTypes from '../../models/processTypes.js';
import ProductTypes from '../../models/productTypes.js';

const router = express.Router();

router.route('/data/initialize')
    .all(tokenValidation)
    .get((request, response, next) => {
        let initData = {
            jobTemplates: null,
            jobTypes: null,
            phases: null,
            processStates: null,
            processTypes: null,
            productTypes: null
        };
        const objection = require('objection');
        objection.transaction(JobTemplates, JobTypes, Phases, ProcessStates, ProcessTypes, ProductTypes, (JobTemplates, JobTypes, Phases, ProcessStates, ProcessTypes, ProductTypes, trx) => {
            let initializationQueries = [
                JobTemplates.query().where({ active: true }).orderBy('displaySequence'),
                JobTemplates.query().where({ active: false, deletedAt: null }).orderBy('displaySequence'),
                JobTemplates.query().whereNotNull('deletedAt').orderBy('displaySequence'),
                JobTypes.query().where({ active: true }).orderBy('displaySequence'),
                Phases.query().where({ active: true }).orderBy('displaySequence'),
                ProcessStates.query().where({ active: true }).orderBy('displaySequence'),
                ProcessTypes.query().where({ active: true }).orderBy('displaySequence'),
                ProductTypes.query().where({ active: true }).orderBy('displaySequence')
            ];
            return Promise.all(initializationQueries);
        }).then((resultsets) => {
            initData.jobTemplates = {
                active: resultsets[0],
                inactive: resultsets[1],
                deprecated: resultsets[2]
            };
            initData.jobTypes = {
                active: resultsets[3],
                inactive: resultsets[4],
                deprecated: resultsets[5]
            };
            initData.phases = {
                active: resultsets[6],
                inactive: resultsets[7],
                deprecated: resultsets[8]
            };
            initData.processStates = {
                active: resultsets[9],
                inactive: resultsets[10],
                deprecated: resultsets[11]
            };
            initData.processTypes = {
                active: resultsets[12],
                inactive: resultsets[13],
                deprecated: resultsets[14]
            };
            initData.productTypes = {
                active: resultsets[15],
                inactive: resultsets[16],
                deprecated: resultsets[17]
            };
            return response.status(200).json(initData);
        }).catch((error) => {
            return response.status(500).json(
                endpointErrorHandler(
                    request.method,
                    request.originalUrl,
                    `系統初始化資料讀取失敗: ${error}`
                )
            );
        });
    });

module.exports = router;
