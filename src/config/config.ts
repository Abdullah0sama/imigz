import { S3ClientConfig } from "@aws-sdk/client-s3"
import { ConnectionConfig } from "pg"
import { string } from "zod"



export const config: Config = {
    port: 3000,

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
            endpoint: 'http://localhost:4566',
            forcePathStyle: true
        },
        bucket: 'imigiz-699144434216',
        cloudfrontURL: 'somethinhere',
    }
}



export interface Config {
    port: number,
    JWT_SECRET: string,
    database: ConnectionConfig,
    aws: {
        s3: S3ClientConfig,
        bucket: string,
        cloudfrontURL: string
    }
}