import { Model } from '../config/database.js';

export class PrivilegeRoles extends Model {
    static tableName = 'scheduleSystem.dbo.privilegeRoles';
    // static idColumn = 'id';
    static jsonSchema = {
        type: 'object',
        properties: {}
    }
}
