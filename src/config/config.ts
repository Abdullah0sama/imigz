import { S3ClientConfig } from "@aws-sdk/client-s3"
import { ConnectionConfig } from "pg"
import { getMandatory, getMandatoryInt, getOptional, getOptionalBoolean, undefinedIfNotDevelopment } from "../common/utils/envVariablesGetters"
import * as path from 'path'

import * as dotenv from 'dotenv'


dotenv.config({
    path: path.join(__dirname, '../../', '.env.default')
})

export const config: Config = (() => ({
    port: getMandatoryInt('PORT'),
    host: getMandatory('HOST'),
    CALLBACK: getMandatory('CALLBACK'),
    JWT_SECRET: getMandatory('JWT_SECRET'),
    database: {
        host: getMandatory('DATABASE_HOST'),
        user: getMandatory('DATABASE_USER'),
        database: getMandatory('DATABASE_NAME'),
        password: getMandatory('DATABASE_PASSWORD'),
    },
    aws: {
        s3: {
            region: getMandatory('AWS_S3_REGION'),
            endpoint: undefinedIfNotDevelopment(getOptional('AWS_S3_ENDPOINT', 'http://127.0.0.1:4566')),
            forcePathStyle: undefinedIfNotDevelopment(getOptionalBoolean('AWS_S3_FORCE_PATH_STYLE', true)),

            // For localstack running on a machine without ~/.aws
            credentials: undefinedIfNotDevelopment({
                accessKeyId: 'asfsaf',
                secretAccessKey: 'afknsfn'
            })
        },
        bucket: getMandatory('AWS_S3_BUCKET'),
        cloudfrontURL: getMandatory('AWS_CLOUDFRONT'),
    },

    authServers: {
        github: {
            client_id: getMandatory('GITHUB_CLIENT_ID'),
            client_secret: getMandatory('GITHUB_CLIENT_SECRET')
        }
    }
}))()


export interface Config {
    port: number,
    host: string,
    JWT_SECRET: string,
    CALLBACK: string,
    database: ConnectionConfig,
    aws: {
        s3: S3ClientConfig,
        bucket: string,
        cloudfrontURL: string
    },

    authServers: AuthServers
}

interface AuthServers {
    github: Record<'client_id' | 'client_secret', string>
}
