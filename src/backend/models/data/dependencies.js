import { Model } from '../config/database.js';

export class Dependencies extends Model {
    static tableName = 'scheduleSystem.dbo.dependencies';
    // static idColumn = 'id';
    static jsonSchema = {
        type: 'object',
        properties: {}
    }
}
