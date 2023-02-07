import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('media')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('key', 'uuid', (col) => col.notNull().unique() )
        .addColumn('title', 'varchar(40)', (col) => col.defaultTo(''))
        .addColumn('description', 'varchar(150)', (col) => col.defaultTo(''))
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .dropTable('media')
        .execute()
}