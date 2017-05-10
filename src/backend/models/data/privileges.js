import { Model } from '../config/database.js';

export class Privileges extends Model {
    static tableName = 'scheduleSystem.dbo.privilege';
    // static idColumn = 'id';
    static jsonSchema = {
        type: 'object',
        properties: {}
    }
}
