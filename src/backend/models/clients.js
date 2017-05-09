import { Model } from '../config/database.js';
import Cust from './erp/cust.js';

export class Existing extends Model {
    static tableName = 'scheduleSystem.dbo.existingClients';
    static idColumn = 'CUS_NO';
    static jsonSchema = {
        type: 'object',
        properties: {
            CUS_NO: { type: 'string' },
            email: { type: ['string', null] },
            telegramId: { type: ['integer', null] },
            smartsheetId: { type: ['string', null] },
            enabled: { type: 'boolean' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
            deletedAt: { type: ['string', null] }
        }
    }
}

export class Potential extends Model {
    static tableName = 'scheduleSystem.dbo.potentialClients';
    static idColumn = 'id';
    static jsonSchema = {
        type: 'object',
        properties: {
            id: { type: 'string' },
            CUS_SNM: { type: 'string' },
            SAL_NO: { type: 'integer' },
            email: { type: ['string', null] },
            telegramId: { type: ['integer', null] },
            smartsheetId: { type: ['string', null] },
            enabled: { type: 'boolean' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
            deletedAt: { type: ['string', null] }
        }
    }
}

export class Combined extends Model {
    static tableName = 'scheduleSystem.dbo.clients';
    static idColumn = 'CUS_NO';
    static jsonSchema = {
        type: 'object',
        properties: {
            CUS_NO: { type: 'string' },
            CUS_SNM: { type: 'string' },
            SAL_NO: { type: 'integer' },
            SAL_NAME: { type: 'string' },
            email: { type: ['string', null] },
            telegramId: { type: ['integer', null] },
            smartsheetId: { type: ['string', null] },
            enabled: { type: 'boolean' },
            existing: { type: 'boolean' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
            deletedAt: { type: ['string', null] }
        }
    };
    static relationMappings = {
        existingCustDetail: {
            relation: Model.BelongsToOneRelation,
            modelClass: Cust,
            join: {
                from: 'scheduleSystem.dbo.clients.CUS_NO',
                to: 'DB_U105.dbo.CUST.CUS_NO'
            }
        },
        poentialCustDetail: {
            relation: Model.BelongsToOneRelation,
            modelClass: Potential,
            join: {
                from: 'scheduleSystem.dbo.clients.CUS_NO',
                to: 'scheduleSystem.dbo.potentialClients.id'
            }
        }
    };
}
