import { MediaService } from '../../src/components/media/MediaService'
import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { MediaHandler } from '../../src/components/media/storageHandlers/interface'
import { MediaRepository } from '../../src/components/media/MediaRepository'
import { BaseLogger, pino } from 'pino'
import { CreationError, NotFoundError } from '../../src/common/errors/internalErrors'
import { EntityNotCreatedError, EntityNotFoundError } from '../../src/common/errors/publicErrors'
import { mediaData2 } from '../mock_data/mediaData'
import { FileRequest } from '../../src/common/schema'
import { Writable } from 'node:stream'
import { PassThrough } from 'node:stream'

const loggerMock = createMock<BaseLogger>()

describe('MediaService', () => {
    let mediaService: MediaService
    let mediaHandlerMock: DeepMocked<MediaHandler>
    let mediaRepositoryMock: DeepMocked<MediaRepository>

    beforeEach(async () => {        
        mediaHandlerMock = createMock<MediaHandler>()
        mediaRepositoryMock = createMock<MediaRepository>()
        mediaService = new MediaService(mediaHandlerMock, mediaRepositoryMock, loggerMock)
    })

    describe('get', () => {

        it('Should throw an error if media it not found', async () => {

            const fileName = 'some file'
            jest.spyOn(mediaRepositoryMock, 'getMedia').mockRejectedValue(new NotFoundError())
            await expect(mediaService.getMedia(fileName, {})).rejects.toBeInstanceOf(EntityNotFoundError)
        })

        it('Should return media data with destination URL', async () => {
            const mediaData = mediaData2
            jest.spyOn(mediaRepositoryMock, 'getMedia').mockResolvedValue(mediaData)

            const returnedMediaData = await mediaService.getMedia(mediaData.key, {})
            expect(returnedMediaData.URL).toBeDefined()
            expect(returnedMediaData).toMatchObject(mediaData)

        })
    })
    
    describe('delete', () => {

        it('Should delete from database and object storage', async () => {
            const fileName = 'some file'
            await mediaService.deleteMedia(fileName)

            expect(mediaHandlerMock.deleteMedia).toBeCalled()
            expect(mediaRepositoryMock.deleteMedia).toBeCalled()

        })

    })

    describe('saveMedia', () => {

        it('Should fail if there is an error in create entity in database', async () => {
            const input = Buffer.from(      
                [       '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
                'Content-Disposition: form-data; '
                + 'name="upload_file_0"; filename="1k_a.png"',
                'Content-Type: image/png',
                '',
                'A'.repeat(1023),
                '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k--',
            ].join('\r\n')
            )
            const userId = 1;
            const fileRequest: FileRequest = {
                headers: {
                    'content-type': 'multipart/form-data; boundary=---------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
                },
                pipe: <T>(dest: T, options: any): T => {
                    if(dest instanceof Writable) {
                        dest.write(input)
                        dest.end()
                    }
                    return dest
                }
            };

            jest.spyOn(mediaHandlerMock, 'saveMedia').mockImplementation((file: string, mimeType: string) => {
                const destStream = new PassThrough()
                const destPromise = new Promise((resolve, reject) => {
                    resolve({})
                })
                return {
                    destinationPromise: destPromise,
                    destinationStream: destStream
                }
            })


            jest.spyOn(mediaRepositoryMock, 'createMedia').mockRejectedValue(new CreationError())
            await expect(mediaService.saveMedia(userId, fileRequest)).rejects.toBeInstanceOf(EntityNotCreatedError)
        })

        it('Should save media and return key and URL', async () => {
            const input = Buffer.from(      
                [       '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
                'Content-Disposition: form-data; '
                + 'name="upload_file_0"; filename="1k_a.png"',
                'Content-Type: image/png',
                '',
                'A'.repeat(1023),
                '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k--',
            ].join('\r\n')
            )
            const userId = 1;
            const fileRequest: FileRequest = {
                headers: {
                    'content-type': 'multipart/form-data; boundary=---------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
                },
                pipe: <T>(dest: T, options: any): T => {
                    if(dest instanceof Writable) {
                        dest.write(input)
                        dest.end()
                    }
                    return dest
                }
            };

            jest.spyOn(mediaHandlerMock, 'saveMedia').mockImplementation((file: string, mimeType: string) => {
                const destStream = new PassThrough()
                const destPromise = new Promise((resolve, reject) => {
                    resolve({})
                })
                return {
                    destinationPromise: destPromise,
                    destinationStream: destStream
                }
            })

            const mediaInformation = await mediaService.saveMedia(userId, fileRequest)

            expect(mediaInformation.URL).toBeDefined()
            expect(mediaInformation.key).toBeDefined()

        })
    })
})