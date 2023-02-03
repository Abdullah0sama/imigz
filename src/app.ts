
import express from 'express'
import { UserController } from './components/users/UserController';
import { UserService } from './components/users/UserService';
import { UserRepository } from './components/users/UserRepository';
import { createDB } from './config/database/databaseConfig';

export async function createApp (): Promise<express.Application> {

    const app = express();
    app.use(express.json())
    const db = createDB()
    const userRepo = new UserRepository(db)
    const userService = new UserService(userRepo)
    const userController = new UserController(userService)

    userController.setupRouter()
    app.use('/', userController.getRouter())

    return app;
}