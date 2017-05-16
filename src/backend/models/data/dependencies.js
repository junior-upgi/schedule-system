module.exports = (sequelize, DataTypes) => {
    const Dependencies = sequelize.define('dependencies', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            validate: { isUUID: 4 }
        },
        taskId: {
            type: DataTypes.UUID,
            allowNull: false,
            validate: { isUUID: 4 }
        },
        parentTaskId: {
            type: DataTypes.UUID,
            allowNull: false,
            validate: { isUUID: 4 }
        },
        restrictionTypeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { min: 0 }
        },
        lag: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        createdBy: {
            type: DataTypes.UUID,
            allowNull: false,
            validate: { isUUID: 4 }
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updatedBy: {
            type: DataTypes.UUID,
            allowNull: false,
            validate: { isUUID: 4 }
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        deletedBy: {
            type: DataTypes.UUID,
            allowNull: true,
            validate: { isUUID: 4 }
        }
    }, {
        name: {
            singular: 'dependency',
            plural: 'dependencies'
        }
    });
    return Dependencies;
};

/*
import Sequelize from 'sequelize';
import { sequelize } from '../../config/database.js';

export const Dependencies = sequelize.define('dependencies', {
    id: {
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        validate: { isUUID: 4 }
    },
    taskId: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: { isUUID: 4 }
    },
    parentTaskId: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: { isUUID: 4 }
    },
    restrictionTypeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: { min: 0 }
    },
    lag: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    comment: {
        type: Sequelize.TEXT,
        allowNull: true
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
});
*/
