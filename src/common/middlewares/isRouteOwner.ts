
import express from 'express'
import { UserTokenType } from '../../components/auth/AuthSchema'
import { ForbiddenError } from '../errors/publicErrors'

export function isRouteOwner(key: keyof UserTokenType) {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if(req.params[key] === req.userToken[key]) {
            next()
        } else {
            next(new ForbiddenError({ message: 'Not allowed through this route' }))
        }
    }
}