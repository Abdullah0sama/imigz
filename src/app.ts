
import express from 'express'
import { UserController } from './components/users/UserController';
import { UserService } from './components/users/UserService';
import { UserRepository } from './components/users/UserRepository';
export function createApp (): express.Application {

    const app = express();
    const userRepo = new UserRepository()
    const userService = new UserService(userRepo)
    const userController = new UserController(userService)
    userController.setupRouter()
    app.use('/', userController.getRouter())

    return app;
}