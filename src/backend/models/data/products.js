import Sequelize from 'sequelize';
import { sequelize } from '../../config/database.js';

export const Products = sequelize.define('products', {
    id: {
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        validate: { isUUID: 4 }
    },
    jobId: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: { isUUID: 4 }
    },
    reference: {
        type: Sequelize.STRING,
        allowNull: false
    },
    upgPrdCode: {
        // UPG 內部產品編號
        // 新開發產品期初，此編號並不存在
        // 量產時則為必要
        type: Sequelize.STRING,
        allowNull: true
    },
    productTypeId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    deadline: {
        type: Sequelize.DATE,
        allowNull: false,
        validate: { isDate: true }
    },
    observable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    createdBy: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: { isUUID: 4 }
    },
    updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    updatedBy: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: { isUUID: 4 }
    },
    deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
    },
    deletedBy: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: { isUUID: 4 }
    }
}, {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt'
});
