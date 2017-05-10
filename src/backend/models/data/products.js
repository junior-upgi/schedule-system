import { Model } from '../config/database.js';

import Jobs from './jobs.js';
import ProductTypes from './productTypes.js';
import Phases from './phases.js';

export class Products extends Model {
    static tableName = 'scheduleSystem.dbo.products';
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
            jobId: { type: 'string' },
            reference: { type: 'string' },
            upgPrdCode: { type: ['string', null] },
            productTypeId: { type: 'string' },
            description: { type: ['string', null] },
            deadline: { type: 'string' },
            finalPhaseId: { type: 'string' },
            observable: { type: 'boolean' },
            created: { type: 'string' },
            createdBy: { type: 'string' },
            updated: { type: 'string' },
            updatedBy: { type: 'string' },
            deleted: { type: ['string', null] },
            deletedBy: { type: ['string', null] }
        }
    };
    static relationMappings = {
        job: {
            relation: Model.BelongsToOneRelation,
            modelClass: Jobs,
            join: {
                from: 'scheduleSystem.dbo.products.jobId',
                to: 'scheduleSystem.dbo.jobs.id'
            }
        },
        productType: {
            relation: Model.BelongsToOneRelation,
            modelClass: ProductTypes,
            join: {
                from: 'scheduleSystem.dbo.products.productTypeId',
                to: 'scheduleSystem.dbo.productTypes.id'
            }
        },
        finalPhase: {
            relation: Model.BelongsToOneRelation,
            modelClass: Phases,
            join: {
                from: 'scheduleSystem.dbo.products.finalPhaseId',
                to: 'scheduleSystem.dbo.phases.id'
            }
        }
    };
}
