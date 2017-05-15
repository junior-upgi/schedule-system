import system from './system.js';

// connection object for sqlite database
module.exports = {
    dialect: 'sqlite',
    storage: `${system.systemReference}.db` // path to database file
};
