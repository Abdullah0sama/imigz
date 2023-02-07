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
        
        this.router.post('/upload', async (req, res) => {   
    
            const key = await this.mediaService.saveMedia(req);
            return res.status(303).send({ 
                data: { key }
            })

        })

    }

    getRouter() {
        return this.router  
    }
}


