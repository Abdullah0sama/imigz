
import express from 'express'
import { UserController } from './components/users/UserController';
import { UserService } from './components/users/UserService';
import { UserRepository } from './components/users/UserRepository';
import { createDB } from './config/database/databaseConfig';
import { ErrorHandler } from './common/errors/ErrorHandler';
import pino, { LoggerOptions } from 'pino';
import { MediaController } from './components/media/MediaController';
import { MediaService } from './components/media/MediaService';
import { S3Client } from '@aws-sdk/client-s3'
import { config } from './config/config';
import { MediaRepository } from './components/media/MediaRepository';
import { healthCheck } from './healthcheck';
// import qs from 'qs';

export function createApp (loggerOptions: LoggerOptions = {}): express.Application {

    const app = express();
    pino()

    // To Remove aggreatelistingparams middleware
    // app.set('query parser', (str: string) => {
    //     const out = qs.parse(str, { allowDots: true })
    //     console.dir(out, {depth: null})
    // })
    app.use(express.json())
    const logger = pino(loggerOptions)
    app.internalModules = {
        logger: logger
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const s3Client = new S3Client(config.aws.s3 )

    app.get('/', (req, res) => {
        res.send('Hello V1')
    })

    
    const db = createDB()
    const userRepo = new UserRepository(db, logger.child({source: 'UserRepository'}))
    const userService = new UserService(userRepo)
    const userController = new UserController(userService)
    const mediaRepository = new MediaRepository(db, logger.child({source: 'MediaRepository'}))
    const mediaService = new MediaService(s3Client, mediaRepository, logger.child({source: 'MediaService'}))
    const mediaController = new MediaController(mediaService)
    userController.setupRouter()
    app.use('/users', userController.getRouter())
    mediaController.setupRouter()
    app.use('/media', mediaController.getRouter())
    app.get('/health', healthCheck)
    app.use(ErrorHandler)
    
    return app;
}