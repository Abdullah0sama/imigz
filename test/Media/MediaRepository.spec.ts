import { MediaRepository } from '../../src/components/media/MediaRepository'
import { afterEach, beforeEach, describe, expect, it, test } from '@jest/globals'
import { createDB } from '../../src/config/database/databaseConfig'
import { mediaData1 } from '../mock_data/mediaData'
import { CreateMediaType, MediaSelectType } from '../../src/components/media/MediaSchema'
import { v4 as uuidv4 } from 'uuid'
import { CreationError, NotFoundError } from '../../src/common/errors/internalErrors'
import { fakePino } from '../utils'

const db = createDB()
const mediaRepository = new MediaRepository(db, fakePino)

const insertIntoDb = (values: CreateMediaType) => {
    return db.insertInto('media')
        .values(values)
        .execute()
}

const deleteFromDb = (key: string) => {
    return db.deleteFrom('media')
        .where('key', '=', key)
        .execute()
}

describe('MediaRepository: createMedia', () => {
    afterEach(async () => {

        await deleteFromDb(mediaData1.key)
    })

    it('Should create media record in database and return id', async () => {
        const mediaInfo = mediaData1
        const { id } = await mediaRepository.createMedia(mediaInfo)
        expect(id).toBeDefined()
    })

    it('Should throw an error when key is duplicate', async () => {
        const mediaInfo = mediaData1
        await mediaRepository.createMedia(mediaInfo)
        await expect(mediaRepository.createMedia(mediaInfo))
            .rejects
            .toThrowError(new CreationError(`Failed To create media because 'key' value already exists`))
    })
})


describe('MediaRepository: getMedia', () => {
    beforeEach(async () => {
        await insertIntoDb(mediaData1)
    })

    afterEach(async () => {
        await deleteFromDb(mediaData1.key)
    })

    it('Should get media record from database', async () => {   
        const mediaInfo = mediaData1
        const retMediaInfo = await mediaRepository.getMedia(mediaInfo.key, {})
        expect(retMediaInfo).toMatchObject(mediaInfo)
    })

    it('Should get media record and select subset of fields', async () => {
        const mediaInfo = mediaData1
        const selectFields: MediaSelectType['select'] = ['id', 'created_at', 'key']
        const retMediaInfo = await mediaRepository.getMedia(mediaInfo.key, {
            select: selectFields
        })
        expect(Object.keys(retMediaInfo)).toEqual(selectFields)
    })

    it('Should fail when media record does not exist', async () => {
        const key = uuidv4()
        await expect(mediaRepository.getMedia(key, {})).rejects.toThrow(new NotFoundError(`Failed to find media '${key}'`))
    })
})

describe('MediaRepository: deleteMedia', () => {
    beforeEach(async () => {
        await insertIntoDb(mediaData1)
    })

    afterEach(async () => {
        await deleteFromDb(mediaData1.key)
    })

    it('Should delete media', async () => {
        const mediaInfo = mediaData1
        await mediaRepository.deleteMedia(mediaInfo.key)
        const ret = await db.selectFrom('media').selectAll().where('key', '=', mediaInfo.key).executeTakeFirst()
        expect(ret).toBeUndefined()
    })
})



describe('MediaRepository: updateMedia', () => {
    beforeEach(async () => {
        await insertIntoDb(mediaData1)
    })

    afterEach(async () => {
        await deleteFromDb(mediaData1.key)
    })

    it('Should update media', async () => {
        const mediaInfo = mediaData1
        const updateData = {
            title: 'Some different title',
            description: 'Some different desc'
        }

        await mediaRepository.updateMedia(mediaInfo.key, updateData)
        const retData = await db.selectFrom('media').select(['title', 'description'])
            .where('key', '=', mediaInfo.key).executeTakeFirst()
        expect(retData).toMatchObject(updateData)
    })

    it('Should throw an error if media does not exist', async () => {
        const key = uuidv4()
        const updateData = {
            title: 'Some different title',
            description: 'Some different desc'
        }

        await expect(mediaRepository.updateMedia(key, updateData))
            .rejects
            .toThrowError(new NotFoundError(`Failed to find media '${key}'`))
    })
})

