// Update with your config settings.

module.exports = {
    development: {
        client: 'mssql',
        connection: {
            server: '127.0.0.1',
            port: 1433,
            user: 'sa',
            password: 'attn@3100',
            database: 'scheduleSystem'
        },
        debug: true,
        pool: {
            max: 10,
            min: 2
        }
    },
    production: {
        client: 'mssql',
        connection: {
            server: '192.168.168.5',
            port: 1433,
            user: 'upgiSystem',
            password: 'upgiSystem',
            database: 'scheduleSystem'
        },
        debug: true,
        pool: {
            max: 10,
            min: 2
        }
    }
};
