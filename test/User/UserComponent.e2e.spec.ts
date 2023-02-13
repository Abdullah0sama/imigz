import { afterAll, beforeAll, beforeEach, describe, expect, it, test } from '@jest/globals'
import request from 'supertest'
import { createApp } from '../../src/app'
import { userData2 } from '../mock_data/userData'
import { generateJwtToken } from '../../src/common/utils/jwtUtils'
import { config } from '../../src/config/config'

const app = createApp({
    level: 'silent'
})

describe('User Component', () => {
    
    afterAll(async () => {
        
    })
    it('Should be perform simple CRUD flow on user', async () => {
        const userData = userData2
        const token = await generateJwtToken({ username: userData.username  }, '1m', config.JWT_SECRET)

        const { body: returnedPostBody } = await request(app)
            .post('/users/')
            .send(userData)
            .expect(201)
        
        expect(returnedPostBody.data).toMatchObject(userData)

        const updateUser = {
            bio: 'somehting something not here',
            email: 'hello@gamil.com'
        }

        await request(app)
            .patch(`/users/${userData.username}`)
            .send(updateUser)
            .set('Authorization', `Bearer ${token}`)
            .expect(204)
        
        const { body: returnedUpdatedUser } = await request(app)
            .get(`/users/${userData.username}`)
            .expect(200)

        expect(returnedUpdatedUser.data).toMatchObject(updateUser)

        await request(app)
            .delete(`/users/${userData.username}`)
            .set('Authorization', `Bearer ${token}`)
        
        const { body: retError } = await request(app)
            .get(`/users/${userData.username}`)
            .expect(404)

        expect(retError.message).toEqual(`Failed to find user '${userData.username}'`)
    })
})