/* eslint-disable no-console */
import { FileMigrationProvider, Migrator } from 'kysely';
import * as path from 'path'
import { promises as fs } from 'fs';
import { createDB } from './databaseConfig';


export async function migrateToLatest() {

    console.log('Migration is about to be applied!')

    const db = await createDB()
    const migrator = new Migrator({
        db, 
        provider: new FileMigrationProvider({
            fs, 
            path,
            migrationFolder: path.join(__dirname, 'migrations/')
        })
    })

    const { error, results } = await migrator.migrateDown()

    results?.forEach((it) => {
        if (it.status === 'Success') {
            console.log(`migration down of "${it.migrationName}" was executed successfully`)
        } else if (it.status === 'Error') {
            console.error(`failed to execute migration down "${it.migrationName}"`)
        }
    })

    if (error) {
        console.error('failed to migrate')
        console.error(error)
        process.exit(1)
    }

    console.log('Migration has finished!');
    await db.destroy()
    
}

migrateToLatest()