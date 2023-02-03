import { Kysely, NoResultError } from "kysely";
import { ComparatorsExpression, CreateUserType, DefaultUserKeys, UpdateUserType, UserListingType, UserSelectType } from "./UserSchema";
import { Database } from "../../config/database/DatabaseTypes";
import { QueryBuilderWithSelection } from "kysely/dist/cjs/parser/select-parser";
import { From } from "kysely/dist/cjs/parser/table-parser";
import { OrderByDirection } from "kysely/dist/cjs/parser/order-by-parser";
import { BaseLogger } from "pino";

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
            this.logger.error(`getUser: error when getting user '${username}'`, err)
            if(err instanceof NoResultError) {
                // do something
            } else {
                //something else
            }
        }
    }

    async getUsers(listingOptions: UserListingType) {
        
        try {
            const selectedFields = (listingOptions.select) ? listingOptions.select : DefaultUserKeys
            let query = this.db.selectFrom('user')
                .select(selectedFields)
            
            if(listingOptions.limit) query.limit(listingOptions.limit)
            if(listingOptions.offset) query.offset(listingOptions.offset)

            query = this.orderQuery(listingOptions, query)
            query = this.whereQuery(listingOptions, query)
            console.log(query.compile().sql)
            const users = query.execute()
            return users
        } catch (err) {
            this.logger.error('getUsers: error when getting users', err)
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
            this.logger.error('createUser: failed to create user', err)
        }
    }

    async deleteUser(username: string) {
        try {
            await this.db.deleteFrom('user')
                .where('user.username', '=', username)
                .execute()
        } catch (err) {
            this.logger.error('deleteUser: failed to delete user', err)
        }
    }

    async updateUser(username: string, userInfo: UpdateUserType) {
        try {
            await this.db.updateTable('user')
                .set(userInfo)
                .where('username', '=', username)
                .execute()
        } catch (err) {
            this.logger.error('updateUser: failed to update user', err)
        }
    }


    // To be refactored to a generic function
    private whereQuery(listingOptions: UserListingType, query: QueryBuilderWithSelection<From<Database, "user">, "user", {}, "username" | "name" | "email" | "bio">) {
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
    private orderQuery(listingOptions: UserListingType, query: QueryBuilderWithSelection<From<Database, "user">, "user", {}, "username" | "name" | "email" | "bio">) {
        if(!listingOptions.orderby) return query;

        const orderByOptions = listingOptions.orderby;
        for(const field of Object.keys(orderByOptions)) {
            const typedField = field as (keyof typeof orderByOptions)
            query = query.orderBy(typedField, orderByOptions[typedField])
        }
        return query
    }
}

