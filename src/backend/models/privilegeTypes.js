import { Model } from '../config/database.js';

export class PrivilegeTypes extends Model {
    static tableName = 'scheduleSystem.dbo.privilegeTypes';
    // static idColumn = 'id';
    static jsonSchema = {
        type: 'object',
        properties: {}
    }
}
