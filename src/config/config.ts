import { S3ClientConfig } from "@aws-sdk/client-s3"
import { ConnectionConfig } from "pg"



export const config: Config = {
    port: 3000,
    database: {
        host: 'localhost',
        user: 'admin',
        database: 'imigz',
        password: 'postgres',
    },
    aws: {
        s3: {
            region: 'us-east-1',
        }
    }
}



export interface Config {
    port: number
    database: ConnectionConfig,
    aws: {
        s3: S3ClientConfig
    }
}