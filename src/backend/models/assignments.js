import { Model } from '../config/database.js';

export class Assignments extends Model {
    static tableName = 'scheduleSystem.dbo.assignments';
    static idColumn = 'id';
    static jsonSchema = {
        type: 'object',
        properties: {
            id: { type: 'string' },
            jobTypeId: { type: 'string' },
            reference: { type: 'string' },
            clientId: { type: 'string' },
            description: { type: 'text' }
        }
    }
}
