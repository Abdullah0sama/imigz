
import { Kysely, Generated } from "kysely"
interface UserTable {
    id: Generated<number>
    username: string,
    name: string, 
    email: string,
    bio: string | null,
    created_at: Generated<Date>
}

export interface Database {
    user: UserTable
}