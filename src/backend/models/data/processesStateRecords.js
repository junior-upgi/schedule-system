import { Model } from '../config/database.js';

export class ProcessesStateRecords extends Model {
    static tableName = 'scheduleSystem.dbo.processesStateRecords';
    static idColumn = 'id';
    static jsonSchema = {
        type: 'object',
        required: [
            'processId',
            'processStateId',
            'createdBy',
            'updatedBy'
        ],
        properties: {
            id: { type: 'string' },
            processId: { type: 'string' },
            processStateId: { type: 'string' },
            comment: { type: ['string', null] },
            createdAt: { type: 'string' },
            createdBy: { type: 'string' },
            updatedAt: { type: 'string' },
            updatedBy: { type: 'string' },
            deletedAt: { type: ['string', null] },
            deletedBy: { type: ['string', null] }
        }
    };
}
