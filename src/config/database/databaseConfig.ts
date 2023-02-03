import { Kysely, PostgresDialect } from 'kysely'
import { Database } from './DatabaseTypes'
import { Pool } from 'pg'

export const createDB = () => {

    return new Kysely<Database>({
        dialect: new PostgresDialect({
            pool: new Pool({
                host: 'localhost',
                user: 'admin',
                database: 'imigz',
                password: 'postgres'
            })
        })
    })
}