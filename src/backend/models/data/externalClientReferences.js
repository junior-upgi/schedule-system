import Sequelize from 'sequelize';
import { sequelize } from '../../config/database.js';

export const ExternalClientReferences = sequelize.define('externalClientReferences', {
    clientId: { // 系統內部客戶資料 ID
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
        validate: { isUUID: 4 }
    },
    externalId: { // 外部客戶資料來源資料 ID (天心 ERP 資料表 CUST 欄位 CUS_NO)
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
        validate: {
            isAlpha: true,
            isUppercase: true,
            notEmpty: true
        }
    },
    personnelId: { // 責任業務
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
        validate: { isUUID: 4 }
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
    }
}, {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt'
});
