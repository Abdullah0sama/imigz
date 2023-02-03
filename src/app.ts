
import express from 'express'
import { UserController } from './components/users/UserController';
import { UserService } from './components/users/UserService';
import { UserRepository } from './components/users/UserRepository';
import { createDB } from './config/database/databaseConfig';
import { ErrorHandler } from './common/errors/ErrorHandler';
import pino from 'pino';

export async function createApp (): Promise<express.Application> {

    const app = express();

    app.use(express.json())
    const logger = pino()
    
    const db = createDB()
    const userRepo = new UserRepository(db, logger.child({source: 'UserRepository'}))
    const userService = new UserService(userRepo)
    const userController = new UserController(userService)
    
    userController.setupRouter()
    app.use('/users', userController.getRouter())
    
    app.use(ErrorHandler)
    
    return app;
}