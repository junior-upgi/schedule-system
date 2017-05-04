import Sequelize from 'sequelize';

import { sequelize } from '../config/database.js';

export const JobTemplates = sequelize.define('jobTemplates', {
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
        allowNull: true
    },
    active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 1
    },
    deprecated: {
        type: Sequelize.DATE,
        allowNull: true
    }
});
