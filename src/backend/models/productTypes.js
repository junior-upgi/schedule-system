import Sequelize from 'sequelize';

import { sequelize } from '../config/database.js';

export const ProductTypes = sequelize.define('productTypes', {
    id: {
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    reference: {
        type: Sequelize.STRING,
        allowNull: false
    },
    displaySequence: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
    },
    active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 1
    },
    deprecated: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
    }
}, {
    timestamp: false,
    paranoid: true,
    createdAt: false,
    updatedAt: false,
    deletedAt: 'deprecated',
    underscored: false,
    freezeTableName: true,
    tableName: 'productTypes'
});
