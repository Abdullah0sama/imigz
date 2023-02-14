import express, { Router } from 'express'
import { MediaService } from './MediaService'
import { MediaListingOptionsSchema, MediaSelectSchema, updateMediaSchema } from './MediaSchema'
import { checkJWT } from '../../common/middlewares/checkJwt'
import { AggregateListingParams } from '../../common/middlewares/aggregateListingParams'
import { isResourceOwner } from '../../common/middlewares/isResourceOwner'


export class MediaController {
    private readonly router: express.Router
    private readonly mediaService: MediaService

    constructor(mediaService: MediaService) {
        this.router = Router()
        this.mediaService = mediaService
    }

    setupRouter() {
        
        this.router.post('/upload', 
        checkJWT,
        async (req, res) => {   
            const { userId } = req.userToken
            const storageLocation = await this.mediaService.saveMedia(userId, req);
            return res.status(201).send({ 
                data: { ...storageLocation }
            })
        })

        this.router.get('/:key', async (req, res) => {
            const key = req.params.key
            const mediaSelectOptions = await MediaSelectSchema.parse(req.query)
            const mediaInfo = await this.mediaService.getMedia(key, mediaSelectOptions)
            res.status(200).send({
                data: mediaInfo
            })
        })

        this.router.get('/',
        AggregateListingParams, 
        async (req, res) => {
            const listingOptions = await MediaListingOptionsSchema.parse(req.modifiedQuery)
            const mediaListing = await this.mediaService.listMedia(listingOptions)
            res.status(200).send({
                data: mediaListing
            })
        })

        this.router.delete('/:key', 
        checkJWT,
        isResourceOwner(this.mediaService, 'key', 'userRef', 'userId'),
        async (req, res) => {
            await this.mediaService.deleteMedia(req.params.key)
            res.status(204).send()
        })

        this.router.patch('/:key', 
        checkJWT,
        isResourceOwner(this.mediaService, 'key', 'userRef', 'userId'),
        async (req, res) => {
            const updateMediaInfo = await updateMediaSchema.parse(req.body)
            const key = req.params.key
            await this.mediaService.updateMedia(key, updateMediaInfo)
            res.status(204).send()
        })

    }

    getRouter() {
        return this.router  
    }
}


