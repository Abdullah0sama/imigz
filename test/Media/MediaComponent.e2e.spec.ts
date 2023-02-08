import { describe, expect, it, test } from '@jest/globals'
import request from 'supertest'
import { createApp } from '../../src/app'
import * as path from 'path'

const app = createApp()

const mediaPath = path.join(__dirname, '../mock_data/media')

describe('POST /upload', () => {

    it('Should upload image and get the url pointing to it', async () => {
        const response =  await request(app)
            .post('/media/upload')
            .attach('media', mediaPath + '/tom-gainor-unsplash.jpg')
            .expect(303)

            console.log(response.body)
            expect(response.body.data).toBeDefined()
            expect(response.body.data.key).toBeDefined()

    })

    it('Should upload gif and get the url pointing to it', async () => {

        const response =  await request(app)
            .post('/media/upload')
            .attach('media', mediaPath + '/feeling-rough-voldemort.gif')
            .expect(303)

            console.log(response.body)
            expect(response.body.data).toBeDefined()
            expect(response.body.data.key).toBeDefined()
    })


    it('Should return an error when an unsuporrted type of media is uploaded', async () => {
        
        const response =  await request(app)
            .post('/media/upload')
            .attach('media', mediaPath + '/file_text.txt')
            .expect(415)

            expect(response.body.message).toEqual('Type Provided is not one of the supported files')
    })

    it('Should return an error when a media bigger than a certain amount is uploaded', async () => {

        const response =  await request(app)
        .post('/media/upload')
        .attach('media', mediaPath + '/image_20mb.jpg')
        .expect(413)

        expect(response.body.message).toEqual('Payload is larger than server limit')
    })

})