import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('media')
        .addColumn('userRef', 'integer', (col) => col.references('user.id').onDelete('set null').onUpdate('cascade'))
        .execute()
    }

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('media')
        .dropColumn('userRef')
        .execute()
}