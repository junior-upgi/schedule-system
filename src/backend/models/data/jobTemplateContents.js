import { Model } from '../config/database.js';

export class JobTemplateContents extends Model {
    static tableName = 'scheduleSystem.dbo.jobTemplateContents';
    // static idColumn = 'id';
    static jsonSchema = {
        type: 'object',
        properties: {}
    }
}
