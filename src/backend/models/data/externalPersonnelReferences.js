import Sequelize from 'sequelize';
import { sequelize } from '../../config/database.js';

export const ExternalPersonnelReferences = sequelize.define('externalPersonnelReferences', {
    personnelId: { // 系統內部人員資料 ID
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
        validate: { isUUID: 4 }
    },
    externalId: { // 外部人員資料來源資料 ID (天心 ERP 資料表 SALM 欄位 SAL_NO)
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
        validate: {
            isAlphanumeric: true, // 人員編號包含字母(例: 外勞)
            notEmpty: true
        }
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
