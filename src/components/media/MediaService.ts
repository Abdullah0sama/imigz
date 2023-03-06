import { BaseLogger } from 'pino';
import busboy from 'busboy';
import * as path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { EntityNotCreatedError, EntityNotFoundError, PayloadTooLarge, UnsupportedMediaType } from '../../common/errors/publicErrors';
import { MediaRepository } from './MediaRepository';
import { config } from '../../config/config';
import { MediaListingType, MediaSelectType, UpdateMediaType, fileDestinationIdentifier } from './MediaSchema';
import { CreationError, NotFoundError } from '../../common/errors/internalErrors';
import { FileRequest } from '../../common/schema';
import { MediaHandler } from './storageHandlers/interface';

// const localUploadDestination = path.join(__dirname, '../../../', 'uploads')

export class MediaService {
    private static readonly acceptedFiles = ['jpeg', 'jpg', 'png', 'gif']
    private static readonly maxFileSize = 1024 * 1024 * 15;
    private static readonly cloudfrontURL = config.aws.cloudfrontURL

    constructor(
            private readonly mediaHandler: MediaHandler, 
            private readonly mediaRepository: MediaRepository, 
            private readonly logger: BaseLogger
        ) {
    }


    async deleteMedia(key: string) {
        await this.mediaRepository.deleteMedia(key);
        await this.mediaHandler.deleteMedia(key)
    }

    async updateMedia(key: string, mediaInfo: UpdateMediaType) {
        return this.mediaRepository.updateMedia(key, mediaInfo);
    }

    async getMedia(key: string, mediaSelectOptions: MediaSelectType) {
        const mediaData = await this.mediaRepository.getMedia(key, mediaSelectOptions)
            .catch((err) => {
                if(err instanceof NotFoundError) throw new EntityNotFoundError({ 
                    message: err.message
                })
                else throw err;
            })
        
        return {
            ...mediaData,
            URL: this.constructURL(mediaData)
        }
    }

    async listMedia(mediaListingOptions: MediaListingType) {
        return this.mediaRepository.listMedia(mediaListingOptions)
    }

    async saveMedia(userId: number, req: FileRequest) {
        
        try {
            // We only accept on file at a time for now
            const [ mediaInformation ] = await this.uploadPromise(req)
            await this.mediaRepository.createMedia(userId, mediaInformation)        
            return { 
                ...mediaInformation, 
                URL: this.constructURL(mediaInformation) 
            }
        } catch (err) {
            if(err instanceof CreationError) {
                throw new EntityNotCreatedError({
                    message: err.message
                })
            }
            throw err   
        }

    }


    private uploadPromise(req: FileRequest): Promise<fileDestinationIdentifier[]> {
        return new Promise((resolve, reject) => {
            const bb = this.createBusboy(req.headers)
            
            bb.on('file', async (fileName, fileStream, info) => {
                this.logger.info(`file name ${fileName}, info: ${ info.filename }, ${ info.mimeType }`)
                
                const [ mimePrefix, fileType ] = info.mimeType.split('/')
                
                if(mimePrefix != 'image' || !MediaService.acceptedFiles.includes(fileType)) {
                    fileStream.resume()
                    bb.emit('error',new UnsupportedMediaType({ message: 'Type Provided is not one of the supported files' }))
                    return
                }

                const key = uuidv4();
                const destinationFileName = `${key}.${fileType}`
                const { destinationPromise, destinationStream } = this.mediaHandler.saveMedia(destinationFileName, info.mimeType)
                
                fileStream.pipe(destinationStream)
                destinationPromise.then((res) => resolve([ { key, fileType } ]))
                .catch((err) => {
                    this.logger.error(err)
                    reject(err)
                })

                fileStream.on('limit', async () => {
                    bb.emit('error', new PayloadTooLarge({ message: 'Payload is larger than server limit' }))
                    await this.mediaHandler.deleteMedia(destinationFileName)
                })
            })
            
            bb.on('error', (err) => {
                this.logger.error(err, 'busboy error')
                reject(err)
            })

            bb.on('finish', () => {
                this.logger.info('busboy finished')
            })

            req.pipe(bb)
        })
    }  

    // private saveMediaToLocalDisk(filePath: string): SaveToMedia {
    //     const destinationPath = path.join(localUploadDestination, filePath)
    //     const destinationStream = fs.createWriteStream(destinationPath)
    //     const destinationPromise = new Promise((resolve, reject) => {
    //         destinationStream.on('finish', (resolve))
    //         destinationStream.on('error', reject)
    //     })

    //     const cleanUp = () => new Promise((resolve, reject) => {
    //         fs.rm(destinationPath, (err) => {
    //             if(err) reject(err)
    //             else resolve('File delete successfully')
    //         })
    //     })

    //     return { destinationPromise, destinationStream, cleanUp }
    // }

    private createBusboy(headers: FileRequest['headers']): busboy.Busboy {
        const bb = busboy({
            headers,
            limits: {
                files: 1,
                fileSize: MediaService.maxFileSize,
            }
        })

        return bb
    }

    private constructURL(media: Partial<fileDestinationIdentifier>) {
        if(!media.key) return undefined
        const dest = `${media.key}.${ (media.fileType)? media.fileType : '' }`
        return path.join(config.aws.cloudfrontURL, dest)
    }
}
