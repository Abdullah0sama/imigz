import { Kysely, NoResultError } from 'kysely';
import { CreateUserType, DefaultUserKeys, UpdateUserType, UserListingType, UserSelectType } from './UserSchema';
import { Database } from '../../config/database/DatabaseTypes';
import { QueryBuilderWithSelection } from 'kysely/dist/cjs/parser/select-parser';
import { From } from 'kysely/dist/cjs/parser/table-parser';
import { BaseLogger } from 'pino';
import { CreationError, NotFoundError } from '../../common/errors/internalErrors';
import { DatabaseError } from 'pg';
import { ComparatorsExpression } from '../../common/schema';

export class UserRepository {

    private readonly db: Kysely<Database>
    private readonly logger: BaseLogger
    constructor(db: Kysely<Database>, logger: BaseLogger) {
        this.db = db
        this.logger = logger
    }

    async getUser(username: string, userSelectOptions: UserSelectType) {
        try {
            const selectedFields = (userSelectOptions.select) ? userSelectOptions.select : DefaultUserKeys
            const user = await this.db.selectFrom('user')
                .select(selectedFields)
                .where('username', '=', username)
                .executeTakeFirstOrThrow()
            return user;    
        } catch (err) {
            this.logger.error(err, `getUser: error when getting user '${username}'`)
            if(err instanceof NoResultError) {
                throw new NotFoundError(`Failed to find user '${username}'`)
            } else {
                throw err
            }
        }
    }

    async getUsers(listingOptions: UserListingType) {
        
        try {
            const selectedFields = (listingOptions.select) ? listingOptions.select : DefaultUserKeys
            let query = this.db.selectFrom('user')
                .select(selectedFields)
            
            if(listingOptions.limit) query = query.limit(listingOptions.limit)
            if(listingOptions.offset) query = query.offset(listingOptions.offset)

            query = this.orderQuery(listingOptions.orderby, query)
            query = this.whereQuery(listingOptions, query)
            const users = await query.execute()

            return users
        } catch (err) {
            this.logger.error(err, 'getUsers: error when getting users')
            throw err
        }
    }

    async createUser(userInfo: CreateUserType) {
        try {
            const createdUser = await this.db.insertInto('user')
                .values(userInfo)
                .returningAll()
                .executeTakeFirstOrThrow()
                return createdUser
        } catch (err) {
            this.logger.error(err, 'createUser: failed to create user')
            if(err instanceof DatabaseError && err.message.includes('duplicate')) {
                throw new CreationError(`Failed To create user because '${err.constraint?.split('_')[1]}' value already exists`)
            }
            throw err
        }
    }

    async deleteUser(username: string) {
        try {
            await this.db.deleteFrom('user')
                .where('user.username', '=', username)
                .execute()
        } catch (err) {
            this.logger.error(err, 'deleteUser: failed to delete user')
            throw err
        }
    }

    async updateUser(username: string, userInfo: UpdateUserType) {
        try {
            const { numUpdatedRows } = await this.db.updateTable('user')
                .set(userInfo)
                .where('username', '=', username)
                .executeTakeFirst()

            if(!numUpdatedRows) throw new NotFoundError(`Couldn't find user '${username}'`)

        } catch (err) {
            this.logger.error(err, 'updateUser: failed to update user')
            throw err
        }
    }


    // To be refactored to a generic function
    private whereQuery(listingOptions: UserListingType, query: QueryBuilderWithSelection<From<Database, 'user'>, 'user', object, 'username' | 'name' | 'email' | 'bio' | 'id'>) {
        if(!listingOptions.where) return query;
        const whereOptions = listingOptions.where;

        for(const field of Object.keys(whereOptions)) {
            const typedField = field as (keyof typeof whereOptions)
            // Assumption is there is only one comparator expression for each field
            const conditionExpression = whereOptions[typedField];
            if(!conditionExpression) continue;
            const condition = Object.keys(conditionExpression) as (keyof typeof conditionExpression)[] 

            query = query.where(typedField, ComparatorsExpression[condition[0]], conditionExpression[condition[0]])
            
        }

        return query;
    }

    // To be refactored to a generic function
    private orderQuery(orderByOptions: UserListingType['orderby'], 
        query: QueryBuilderWithSelection<From<Database, 'user'>, 'user', object, 'username' | 'name' | 'email' | 'bio' | 'id'>) {
        if(!orderByOptions) return query;
        for(const field of Object.keys(orderByOptions)) {
            const typedField = field as (keyof typeof orderByOptions)
            query = query.orderBy(typedField, orderByOptions[typedField])
        }
        return query
    }
}

