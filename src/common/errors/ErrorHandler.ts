
import express from 'express'
import { errorResolver } from './errorResolver';

export const ErrorHandler = (error: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {

    const resolvedError = errorResolver(error)
    res.status(resolvedError.statusCode).send(resolvedError.payload)
}

