import { Model } from '../config/database.js';

export default class ProcessTypes extends Model {
    static tableName = 'scheduleSystem.dbo.processTypes';
    static idColumn = 'id';
    static jsonSchema = {
        type: 'object',
        required: ['reference'],
        properties: {
            id: { type: 'string' },
            reference: { type: 'string' },
            displaySequence: { type: ['integer', null] },
            active: { type: 'boolean' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
            deletedAt: { type: ['string', null] }
        }
    }
}
