import { Kysely, PostgresDialect } from 'kysely'
import { Database } from './DatabaseTypes'
import { Pool } from 'pg'
import { config } from '../config'

export const createDB = () => {

    return new Kysely<Database>({
        dialect: new PostgresDialect({
            pool: new Pool(config.database)
        })
    })
}