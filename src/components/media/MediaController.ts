import express, { Router } from 'express'
import { MediaService } from './MediaService'


export class MediaController {
    private readonly router: express.Router
    private readonly mediaService: MediaService

    constructor(mediaService: MediaService) {
        this.router = Router()
        this.mediaService = mediaService
    }

    setupRouter() {
        
        this.router.post('/upload', (req, res) => {   
    
            const streamToLocal = this.mediaService.saveMedia(req.headers, res)
            req.pipe(streamToLocal)

        })

    }

    getRouter() {
        return this.router  
    }
}


