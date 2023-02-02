import { Kysely, NoResultError } from "kysely";
import { CreateUserType, DefaultUserKeys, UpdateUserType, UserListingType, UserSelectType } from "./UserSchema";
import { Database } from "../../config/database/DatabaseTypes";

export class UserRepository {

    private readonly db: Kysely<Database>

    constructor(db: Kysely<Database>) {
        this.db = db
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
            if(err instanceof NoResultError) console.log('somethingwrong')
            else console.log('other thing')
        }
    }

    async getUsers(listingOptions: UserListingType) {
        
        try {
            const selectedFields = (listingOptions.select) ? listingOptions.select : DefaultUserKeys
            const query = this.db.selectFrom('user')
                .select(selectedFields)
            
            if(listingOptions.limit) query.limit(listingOptions.limit)
            if(listingOptions.offset) query.offset(listingOptions.offset)

            // query.where(listingOptions.where)

            const users = query.execute()
            return users
        } catch (err) {

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
            console.log(err)
        }
    }

    async deleteUser(username: string) {
        try {
            await this.db.deleteFrom('user')
                .where('user.username', '=', username)
                .execute()
        } catch (err) {

        }
    }

    async updateUser(username: string, userInfo: UpdateUserType) {
        try {
            await this.db.updateTable('user')
                .set(userInfo)
                .where('username', '=', username)
                .execute()
        } catch (err) {

        }
    }

    // private whereQuery(where: Pick<UserListingType, 'where'>) {
        
    //     if(!where.where) return ;
    //     for(const q of where.where) {
            
            
    //     }
    // }
}