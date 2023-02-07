
import { Generated } from 'kysely'

interface UserTable {
    id: Generated<number>
    username: string,
    name: string, 
    email: string,
    bio: string | null,
    created_at: Generated<Date>
}

export interface MediaTable {
    id: Generated<number>,
    title: string | null,
    description: string | null,
    key: string,
    created_at: Generated<Date>
}

export interface Database {
    user: UserTable,
    media: MediaTable
}