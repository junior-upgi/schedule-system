import { Model } from '../config/database.js';
import { Combined } from './clients.js';
import JobTypes from './jobTypes.js';

export default class Jobs extends Model {
    static tableName = 'scheduleSystem.dbo.jobs';
    static idColumn = 'id';
    static jsonSchema = {
        type: 'object',
        required: [
            'jobTypeId',
            'reference',
            'clientId',
            'deadline',
            'createdBy',
            'updatedBy'
        ],
        properties: {
            id: { type: 'string' },
            jobTypeId: { type: 'string' },
            reference: { type: 'string' },
            clientId: { type: 'string' },
            description: { type: ['string', null] },
            deadline: { type: 'string' },
            observable: { type: 'boolean' },
            createdAt: { type: 'string' },
            createdBy: { type: 'string' },
            updatedAt: { type: 'string' },
            updatedBy: { type: 'string' },
            deletedAt: { type: ['string', null] },
            deletedBy: { type: ['string', null] }
        }
    };
    static relationMappings = {
        clientDetail: {
            relation: Model.BelongsToOneRelation,
            modelClass: Combined,
            join: {
                from: 'scheduleSystem.dbo.jobs.clientId',
                to: 'scheduleSystem.dbo.clients.CUS_NO'
            }
        },
        jobType: {
            relation: Model.BelongsToOneRelation,
            modelClass: JobTypes,
            join: {
                from: 'scheduleSystem.dbo.jobs.jobTypeId',
                to: 'scheduleSystem.dbo.jobTypes.id'
            }
        }
    };
}
