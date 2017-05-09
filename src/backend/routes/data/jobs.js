import bodyParser from 'body-parser';
import express from 'express';

import { endpointErrorHandler } from '../../utilities/endpointErrorHandler.js';
import { dbConfig } from '../../config/database.js';
import { currentDatetimeString } from '../../utilities/timeRelated.js';
import tokenValidation from '../../middlewares/tokenValidation.js';

import Jobs from '../../models/jobs.js';

const router = express.Router();

router.route('/test')
    .all(tokenValidation)
    .get((request, response, next) => {
        Jobs.query()
            .eager('[clientDetail, jobType]')
            .then((resultset) => {
                return response.status(200).json(resultset);
            })
            .catch((error) => {
                return response.status(500).json(error);
            });
    });

module.exports = router;
