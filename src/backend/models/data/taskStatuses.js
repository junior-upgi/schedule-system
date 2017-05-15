import Sequelize from 'sequelize';
import { sequelize } from '../../config/database.js';

export const TaskStatuses = sequelize.define('taskStatuses', {
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
    taskStatusTypeId: {
        type: Sequelize.INTEGER,
        allowNull: false
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
}, {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt'
});
