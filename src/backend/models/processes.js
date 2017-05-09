import { Model } from '../config/database.js';

import Products from './products.js';
import ProcessTypes from './processTypes.js';
import Phases from './phases.js';
import ProcessStates from './processesStates.js';

export class Processes extends Model {
    static tableName = 'scheduleSystem.dbo.processes';
    static idColumn = 'id';
    static jsonSchema = {
        type: 'object',
        properties: {
            id: { type: 'string' },
            productId: { type: 'string' },
            processTypeId: { type: 'string' },
            description: { type: ['string', null] },
            phaseId: { type: 'string' },
            deadline: { type: 'string' },
            startedAt: { type: 'string' },
            durationEstimate: { type: 'integer' },
            completedAt: { type: 'string' },
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
        product: {
            relation: Model.BelongsToOneRelation,
            modelClass: Products,
            join: {
                from: 'scheduleSystem.dbo.processes.productId',
                to: 'scheduleSystem.dbo.products.id'
            }
        },
        productType: {
            relation: Model.BelongsToOneRelation,
            modelClass: ProcessTypes,
            join: {
                from: 'scheduleSystem.dbo.processes.processTypeId',
                to: 'scheduleSystem.dbo.processTypes.id'
            }
        },
        finalPhase: {
            relation: Model.BelongsToOneRelation,
            modelClass: Phases,
            join: {
                from: 'scheduleSystem.dbo.processes.phaseId',
                to: 'scheduleSystem.dbo.phases.id'
            }
        },
        stateRecords: {
            relation: Model.ManyToManyRelation,
            modelClass: ProcessStates,
            join: {
                from: 'scheduleSystem.dbo.ProcessStateRecords.processId',
                to: 'scheduleSystem.dbo.ProcessStateRecords.processStateId'
            },
            to: 'scheduleSystem.dbo.ProcessStates.id'
        }
    };
}
