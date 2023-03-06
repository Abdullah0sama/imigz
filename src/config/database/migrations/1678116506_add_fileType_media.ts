import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('media')
        .addColumn('fileType', 'varchar(40)', (col) => col.defaultTo(''))
        .execute()
    }

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('media')
        .dropColumn('fileType')
        .execute()
}