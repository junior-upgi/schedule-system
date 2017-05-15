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

export const dbConfig = { // also used as knex.js / sequelize.js init object
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

export const sequelize = new Sequelize(
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
