import express from 'express'
import {  MediaDefaultFields } from '../../components/media/MediaSchema'
import { UserTokenType } from '../../components/auth/AuthSchema'
import { ForbiddenError } from '../errors/publicErrors'
import { MediaService } from '../../components/media/MediaService'

export function isResourceOwner(service: MediaService, key: string, 
        refKey: typeof MediaDefaultFields[number],
        tokenKey: keyof UserTokenType) {
            
    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const resourceData = await service.getMedia(req.params[key], { 'select': [refKey] })
        
        if(resourceData[refKey] === req.userToken[tokenKey]) {
            next()
        } else {
            next(new ForbiddenError({ message: 'Not allowed to get through this route' }))
        }
    }
}