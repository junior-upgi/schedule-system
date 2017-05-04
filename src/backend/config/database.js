import { development } from './server.js';

const mssqlServerPort = 1433;

const upgiSystemAccount = 'upgiSystem';
const upgiSystemPassword = 'upgiSystem';

const ormDebugOption = false;

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
