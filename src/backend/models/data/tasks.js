import Sequelize from 'sequelize';
import { sequelize } from '../../config/database.js';

export const Tasks = sequelize.define('tasks', {
    id: {
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        validate: { isUUID: 4 }
    },
    productId: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: { isUUID: 4 }
    },
    taskTypeId: {
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
    startedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        validate: { isDate: true }
    },
    durationEstimate: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    completedAt: {
        type: Sequelize.DATE,
        allowNull: true,
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
