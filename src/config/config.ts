import { S3ClientConfig } from "@aws-sdk/client-s3"
import { ConnectionConfig } from "pg"
import { string } from "zod"



export const config: Config = {
    port: 3000,
    host: 'http://localhost:3000',

    JWT_SECRET: "somehting",

    database: {
        host: 'localhost',
        user: 'admin',
        database: 'imigz',
        password: 'postgres',
    },
    aws: {
        s3: {
            region: 'us-east-1',
            endpoint: 'http://127.0.0.1:4566',
            forcePathStyle: true,
            credentials: {
                accessKeyId: 'somthingDump',
                secretAccessKey: 'somethingDumper'
            }
        },
        bucket: 'imigiz-699144434216',
        cloudfrontURL: 'somethinhere',
    },

    authServers: {
        github: {
            client_id: 'jn',
            client_secret: 'j'
        }
    }
}



export interface Config {
    port: number,
    host: string,
    JWT_SECRET: string,
    database: ConnectionConfig,
    aws: {
        s3: S3ClientConfig,
        bucket: string,
        cloudfrontURL: string
    },

    authServers: {
        github: Record<'client_id' | 'client_secret', string>
    }
}