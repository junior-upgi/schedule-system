import Sequelize from 'sequelize';
import { sequelize } from '../../config/database.js';

export const Privileges = sequelize.define('privileges', {
    id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
        validate: { isUUID: 4 }
    },
    privilegeTypeId: { // 權限種類 (例：客戶、員工、廠商)
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: { min: 0 }
    },
    privilegeRoleId: { // 工作角色 (例：管理員、使用者、主管)
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: { min: 0 }
    },
    active: {
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
}, {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt'
});
