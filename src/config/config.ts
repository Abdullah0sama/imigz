import { ConnectionConfig } from "pg"



export const config: Config = {
    port: 3000,
    database: {
        host: 'localhost',
        user: 'admin',
        database: 'imigz',
        password: 'postgres'
    }
}



export interface Config {
    port: number
    database: ConnectionConfig
}