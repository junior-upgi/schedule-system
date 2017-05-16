module.exports = (sequelize, DataTypes) => {
    const JobTemplateContents = sequelize.define('jobTemplateContents', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            validate: { isUUID: 4 }
        },
        jobTemplateId: { // 工作範本
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { min: 0 }
        },
        productIndex: { // 範本產品編號區分
            type: DataTypes.INTEGER,
            allowNull: false
        },
        phaseId: { // 歸屬工作階段
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { min: 0 }
        },
        reference: {
            type: DataTypes.STRING,
            allowNull: false
        },
        productTypeId: { // 產品種類
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { min: 0 }
        },
        taskTypeId: { // 工序種類
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { min: 0 }
        },
        defaultDuration: { // 預設工序需時
            type: DataTypes.INTEGER,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        displaySequence: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: { min: 0 }
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
            singular: 'jobTemplateContent',
            plural: 'jobTemplateContents'
        }
    });
    return JobTemplateContents;
};

/*
import Sequelize from 'sequelize';
import { sequelize } from '../../config/database.js';

export const JobTemplateContents = sequelize.define('jobTemplateContents', {
    id: {
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        validate: { isUUID: 4 }
    },
    jobTemplateId: { // 工作範本
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: { min: 0 }
    },
    productIndex: { // 範本產品編號區分
        type: Sequelize.INTEGER,
        allowNull: false
    },
    phaseId: { // 歸屬工作階段
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: { min: 0 }
    },
    reference: {
        type: Sequelize.STRING,
        allowNull: false
    },
    productTypeId: { // 產品種類
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: { min: 0 }
    },
    taskTypeId: { // 工序種類
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: { min: 0 }
    },
    defaultDuration: { // 預設工序需時
        type: Sequelize.INTEGER,
        allowNull: false
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    displaySequence: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: { min: 0 }
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
