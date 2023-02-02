import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('user')
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('username', 'varchar(40)', (col) => col.unique())
        .addColumn('bio', 'varchar(60)', (col) => col.defaultTo(''))
        .addColumn('email', 'varchar(40)', (col) => col.notNull())  
        .addColumn('name', 'varchar(40)', (col) => col.notNull())  
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .dropTable('user')
        .execute()
}