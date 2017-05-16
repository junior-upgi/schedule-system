module.exports = (sequelize, DataTypes) => {
    const Jobs = sequelize.define('jobs', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            validate: { isUUID: 4 }
        },
        jobTypeId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        reference: {
            type: DataTypes.STRING,
            allowNull: false
        },
        clientId: {
            type: DataTypes.UUID,
            allowNull: false,
            validate: { isUUID: 4 }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        deadline: {
            type: DataTypes.DATE,
            allowNull: true,
            validate: { isDate: true }
        },
        observable: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
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
            singular: 'job',
            plural: 'jobs'
        }
    });
    return Jobs;
};

/*
import Sequelize from 'sequelize';
import { sequelize } from '../../config/database.js';

import { JobTypes } from '../reference/jobTypes.js';
import { Clients } from '../reference/clients.js';
import { Personnel } from '../reference/personnel.js';

export const Jobs = sequelize.define('jobs', {
    id: {
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        validate: { isUUID: 4 }
    },
    jobTypeId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    reference: {
        type: Sequelize.STRING,
        allowNull: false
    },
    clientId: {
        type: Sequelize.UUID,
        allowNull: false,
        validate: { isUUID: 4 }
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    deadline: {
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
        type: Sequelize.UUID,
        allowNull: false,
        validate: { isUUID: 4 }
    },
    updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    updatedBy: {
        type: Sequelize.UUID,
        allowNull: false,
        validate: { isUUID: 4 }
    },
    deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
    },
    deletedBy: {
        type: Sequelize.UUID,
        allowNull: true,
        validate: { isUUID: 4 }
    }
}, {
    name: {
        singular: 'job',
        plural: 'jobs'
    }
});

Jobs.hasOne(JobTypes, { foreignKey: 'FK_jobs_jobTypes', sourceKey: 'jobTypeId', targetKey: 'id' });
Jobs.belongsTo(Clients, { foreignKey: 'FK_jobs_clients', sourceKey: 'clientId', targetKey: 'id' });
Jobs.hasOne(Personnel, { foreignKey: 'FK_jobs_personnel_createdBy', sourceKey: 'createdBy', targetKey: 'id' });
Jobs.hasOne(Personnel, { foreignKey: 'FK_jobs_personnel_updatedBy', sourceKey: 'updatedBy', targetKey: 'id' });
Jobs.hasOne(Personnel, { foreignKey: 'FK_jobs_personnel_deletedBy', sourceKey: 'deletedBy', targetKey: 'id' });

*/
