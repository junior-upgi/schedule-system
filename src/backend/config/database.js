// import path from 'path';
import Sequelize from 'sequelize';

import { development, systemReference, timezone } from './server.js';
import { logger } from '../utilities/logger.js';

const mssqlServerPort = 1433;

const upgiSystemAccount = 'upgiSystem';
const upgiSystemPassword = 'upgiSystem';

const ormDebugOption = true;

// database access configuration
function mssqlServerHost() {
    if (development === true) {
        return 'http://127.0.0.1'; // access database through SSH (development)
    } else {
        return 'http://192.168.168.5'; // access database from LAN (production)
    }
}

export function mssqlServerUrl() {
    if (development === true) {
        return `${mssqlServerHost()}:${mssqlServerPort}`; // access database through SSH (development)
    } else {
        return `${mssqlServerHost()}:${mssqlServerPort}`; // access database from LAN (production)
    }
}

export const dbConfig = { // also used as knex.js init object
    client: 'mssql',
    connection: {
        server: mssqlServerHost().slice(7),
        user: upgiSystemAccount,
        password: upgiSystemPassword,
        port: mssqlServerPort
    },
    debug: ormDebugOption,
    server: mssqlServerHost().slice(7),
    user: upgiSystemAccount,
    password: upgiSystemPassword,
    port: mssqlServerPort,
    connectionTimeout: 60000,
    requestTimeout: 60000
};

const objection = require('objection');
export const Model = objection.Model;
const Knex = require('knex');

Model.knex(Knex(dbConfig));

export const sequelize = new Sequelize( // sequelize init object
    systemReference, // database
    upgiSystemAccount, // username
    upgiSystemPassword, // password
    { // connection object
        host: mssqlServerHost().slice(7),
        port: mssqlServerPort,
        dialect: 'mssql',
        timezone: timezone,
        logging: ormDebugOption ? logger.info : ormDebugOption,
        define: {
            underscored: false,
            freezeTableName: true,
            timestamps: true,
            paranoid: true,
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
            deletedAt: 'deletedAt'
        }
    },
);

export const db = {}; // provide global access to Sequelize models

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.Clients = require('../models/reference/clients.js')(sequelize, Sequelize);
db.JobTemplates = require('../models/reference/jobTemplates.js')(sequelize, Sequelize);
db.jobTypes = require('../models/reference/jobTypes.js')(sequelize, Sequelize);
db.Personnel = require('../models/reference/personnel.js')(sequelize, Sequelize);
db.Phases = require('../models/reference/personnel.js')(sequelize, Sequelize);
db.PrivilegeRoles = require('../models/reference/privilegeRoles.js')(sequelize, Sequelize);
db.PrivilegeTypes = require('../models/reference/privilegeTypes.js')(sequelize, Sequelize);
db.ProductTypes = require('../models/reference/productTypes.js')(sequelize, Sequelize);
db.ProgressTypes = require('../models/reference/progressTypes.js')(sequelize, Sequelize);
db.RestrictionTypes = require('../models/reference/restrictionTypes.js')(sequelize, Sequelize);
db.TaskStatusTypes = require('../models/reference/taskStatusTypes.js')(sequelize, Sequelize);
db.TaskTypes = require('../models/reference/taskTypes.js')(sequelize, Sequelize);

db.ApplicablePhases = require('../models/data/applicablePhases.js')(sequelize, Sequelize);
db.Dependencies = require('../models/data/dependencies.js')(sequelize, Sequelize);
db.externalClientReferences = require('../models/data/externalClientReferences.js')(sequelize, Sequelize);
db.externalPersonnelReferences = require('../models/data/externalPersonnelReferences.js')(sequelize, Sequelize);
db.generalAssignments = require('../models/data/generalAssignments.js')(sequelize, Sequelize);
db.Jobs = require('../models/data/jobs.js')(sequelize, Sequelize);
db.JobTemplateContents = require('../models/data/jobTemplateContents.js')(sequelize, Sequelize);
db.Privileges = require('../models/data/privileges.js')(sequelize, Sequelize);
db.Products = require('../models/data/products.js')(sequelize, Sequelize);
db.Progress = require('../models/data/progress.js')(sequelize, Sequelize);
db.Tasks = require('../models/data/tasks.js')(sequelize, Sequelize);
db.TaskStatuses = require('../models/data/taskStatuses.js')(sequelize, Sequelize);
