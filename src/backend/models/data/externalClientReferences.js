module.exports = (sequelize, DataTypes) => {
    const ExternalClientReferences = sequelize.define('externalClientReferences', {
        clientId: { // 系統內部客戶資料 ID
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            validate: { isUUID: 4 }
        },
        externalId: { // 外部客戶資料來源資料 ID (天心 ERP 資料表 CUST 欄位 CUS_NO)
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
            validate: {
                isAlpha: true,
                isUppercase: true,
                notEmpty: true
            }
        },
        personnelId: { // 責任業務
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            validate: { isUUID: 4 }
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        name: {
            singular: 'externalClientReference',
            plural: 'externalClientReferences'
        }
    });
    return ExternalClientReferences;
};

/*
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
});
*/
