import express, { Router } from 'express'
import { MediaService } from './MediaService'
import { MediaSelectSchema, updateMediaSchema } from './MediaSchema'


export class MediaController {
    private readonly router: express.Router
    private readonly mediaService: MediaService

    constructor(mediaService: MediaService) {
        this.router = Router()
        this.mediaService = mediaService
    }

    setupRouter() {
        
        this.router.post('/upload', async (req, res) => {   
            const storageLocation = await this.mediaService.saveMedia(req);
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

        this.router.delete('/:key', async (req, res) => {
            await this.mediaService.deleteMedia(req.params.key)
            res.status(204).send()
        })

        this.router.patch('/:key', async (req, res) => {
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


