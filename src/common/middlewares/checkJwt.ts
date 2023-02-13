import express from 'express'
import { decodeJwtToken } from '../utils/jwtUtils'
import { UnauthorizedError } from '../errors/publicErrors'
import { config } from '../../config/config'

export async function checkJWT (req: express.Request, res: express.Response, next: express.NextFunction) {

    const authorization = req.headers['authorization']
    if(!authorization) throw new UnauthorizedError({ message: 'Unauthorized' })

    const [ bearer, token ] = authorization.split(' ', 2)

    if(bearer !== 'Bearer') throw new UnauthorizedError({ message: 'Unauthorized' })

    try {
        const decoded: any = await decodeJwtToken(token, config.JWT_SECRET)
        req.userToken = decoded
    } catch (err) {
        throw new UnauthorizedError({ message: 'Unauthorized' })
    }

    next()
} 