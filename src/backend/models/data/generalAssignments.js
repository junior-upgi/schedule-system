module.exports = (sequelize, DataTypes) => {
    const GeneralAssignments = sequelize.define('generalAssignments', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            validate: { isUUID: 4 }
        },
        personnelId: { // 責任人員
            type: DataTypes.UUID,
            allowNull: false,
            validate: { isUUID: 4 }
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
        principle: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
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
            singular: 'generalAssignment',
            plural: 'generalAssignments'
        }
    });
    return GeneralAssignments;
};

/*
import Sequelize from 'sequelize';
import { sequelize } from '../../config/database.js';

export const GeneralAssignments = sequelize.define('generalAssignments', {
    id: {
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        validate: { isUUID: 4 }
    },
    personnelId: { // 責任人員
        type: Sequelize.STRING,
        allowNull: false,
        validate: { isUUID: 4 }
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
    principle: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
