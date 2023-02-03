
import express from 'express'

export const ErrorHandler = (error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {


    res.status(500).send({ error: 'Something went wrong' });
}