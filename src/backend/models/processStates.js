import { Model } from '../config/database.js';

export default class ProcessStates extends Model {
    static tableName = 'scheduleSystem.dbo.processStates';
    static jsonSchema = {
        type: 'object',
        required: [],
        properties: {
            id: { type: 'string' },
            reference: { type: 'string' },
            displaySequence: { type: 'integer' },
            active: { type: 'boolean' },
            createdAt: { type: 'datetime' },
            updatedAt: { type: 'datetime' },
            deletedAt: { type: 'datetime' }
        }
    }
}
