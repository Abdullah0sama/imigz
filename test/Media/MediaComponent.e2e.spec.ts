import { afterAll, beforeAll, beforeEach, describe, expect, it, test } from '@jest/globals'
import request from 'supertest'
import { createApp } from '../../src/app'
import * as path from 'path'
import { generateJwtToken } from '../../src/common/utils/jwtUtils'
import { config } from '../../src/config/config'
import { UserRepository } from '../../src/components/users/UserRepository'
import { createDB } from '../../src/config/database/databaseConfig'
import { fakePino } from '../utils'
import { userData1 } from '../mock_data/userData'

const app = createApp()
const db = createDB()
const userRepository = new UserRepository(db, fakePino)

const mediaPath = path.join(__dirname, '../mock_data/media')

describe('POST /upload', () => {
    let userId: number;
    let token: string
    beforeAll(async () => {
        const user = await userRepository.createUser(userData1)
        userId = user.id
    })

    afterAll(async () => {
        await userRepository.deleteUser(userData1.username)
    })
    
    beforeEach(async () => {
        token = await generateJwtToken({ userId }, '1m', config.JWT_SECRET)
    })

    it('Should upload image and get the url pointing to it', async () => {
        const response =  await request(app)
            .post('/media/upload')
            .set('Authorization', `Bearer ${token}`)
            .attach('media', mediaPath + '/tom-gainor-unsplash.jpg')
            .expect(201)

            expect(response.body.data).toBeDefined()
            expect(response.body.data.key).toBeDefined()
            expect(response.body.data.baseURL).toBeDefined()

    }, 10000)

    it('Should upload gif and get the url pointing to it', async () => {
        const response =  await request(app)
            .post('/media/upload')
            .set('Authorization', `Bearer ${token}`)
            .attach('media', mediaPath + '/feeling-rough-voldemort.gif')
            .expect(201)

            expect(response.body.data).toBeDefined()
            expect(response.body.data.key).toBeDefined()
            expect(response.body.data.baseURL).toBeDefined()

    }, 10000)


    it('Should return an error when an unsuporrted type of media is uploaded', async () => {
        
        const response =  await request(app)
            .post('/media/upload')
            .set('Authorization', `Bearer ${token}`)
            .attach('media', mediaPath + '/file_text.txt')
            .expect(415)

            expect(response.body.message).toEqual('Type Provided is not one of the supported files')
    })

    it('Should return an error when a media bigger than a certain amount is uploaded', async () => {

        const response =  await request(app)
        .post('/media/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('media', mediaPath + '/image_20mb.jpg')
        .expect(413)

        expect(response.body.message).toEqual('Payload is larger than server limit')
    })
})


describe('CRUD of Media', () => {
    let userId: number;
    let token: string
    beforeAll(async () => {
        const user = await userRepository.createUser(userData1)
        userId = user.id
    })

    afterAll(async () => {
        await userRepository.deleteUser(userData1.username)
    })

    beforeEach(async () => {
        token = await generateJwtToken({ userId }, '1m', config.JWT_SECRET)
    })

    it('Should Get, update and delete media', async () => {
        const res =  await request(app)
            .post('/media/upload')
            .set('Authorization', `Bearer ${token}`)
            .attach('media', mediaPath + '/feeling-rough-voldemort.gif')
            .expect(201)

        const { key } = res.body.data

        const { body: mediaData } =  await request(app)
            .get(`/media/${key}`)

        expect(mediaData.data.id).toBeDefined()
        expect(mediaData.data.key).toBeDefined()

        const updateMedia = {
            title: 'some title',
            description: 'some descri'
        }

        await request(app)
            .patch(`/media/${key}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updateMedia)
            .expect(204)

        const { body: { data: updatedMedia } } =  await request(app)
            .get(`/media/${key}`)

        expect(updatedMedia).toMatchObject(updateMedia)

        await request(app)
            .delete(`/media/${key}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204)

        // I should check the storage to check if it is deleted
        
        const response = await request(app)
            .get(`/media/${key}`)
            .expect(404)
        
        expect(response.body.message).toEqual(`Failed to find media '${key}'`)
    })
})