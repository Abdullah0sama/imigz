import { BaseLogger } from 'pino';
import busboy from 'busboy';
import express from 'express'
import * as fs from 'fs'
import * as path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { EntityNotCreatedError, EntityNotFoundError, PayloadTooLarge, UnsupportedMediaType } from '../../common/errors/publicErrors';
import { DeleteObjectCommand, PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { MediaRepository } from './MediaRepository';
import { PassThrough } from 'node:stream'
import { config } from '../../config/config';
import { MediaListingType, MediaSelectType, UpdateMediaType } from './MediaSchema';
import { CreationError, NotFoundError } from '../../common/errors/internalErrors';

const localUploadDestination = path.join(__dirname, '../../../', 'uploads')
const s3UploadDestination = path.join('uploads');

export class MediaService {
    private static readonly acceptedFiles = ['jpeg', 'jpg', 'png', 'gif']
    private static readonly maxFileSize = 1024 * 1024 * 15;
    private static readonly cloudfrontURL = config.aws.cloudfrontURL
    private readonly logger: BaseLogger
    private readonly s3Client: S3Client
    private readonly mediaRepositroy: MediaRepository

    constructor(s3Client: S3Client, mediaRepository: MediaRepository, logger: BaseLogger) {
        this.logger = logger
        this.s3Client = s3Client
        this.mediaRepositroy = mediaRepository

        // if(!fs.existsSync(localUploadDestination))
        //     fs.mkdirSync(localUploadDestination)
    }


    async deleteMedia(key: string) {
        await this.mediaRepositroy.deleteMedia(key);
        await this.deleteMediaFromS3(key)
    }

    async updateMedia(key: string, mediaInfo: UpdateMediaType) {
        return this.mediaRepositroy.updateMedia(key, mediaInfo);
    }

    async getMedia(key: string, mediaSelectOptions: MediaSelectType) {
        return this.mediaRepositroy.getMedia(key, mediaSelectOptions)
            .catch((err) => {
                if(err instanceof NotFoundError) throw new EntityNotFoundError({ 
                    message: err.message
                })
                else throw err;
            })
    }

    async listMedia(mediaListingOptions: MediaListingType) {
        return this.mediaRepositroy.listMedia(mediaListingOptions)
    }

    async saveMedia(userId: number, req: express.Request) {
        
        try {
            // We only accept on file at a time for now
            const [ key ] = await this.uploadPromise(req)
            await this.mediaRepositroy.createMedia(userId, { key })
            
            return { 
                key, 
                baseURL: MediaService.cloudfrontURL 
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


    private uploadPromise(req: express.Request): Promise<string[]> {
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
                const { destinationPromise, destinationStream, cleanUp } = this.saveMediaToS3(destinationFileName, info.mimeType)
                
                fileStream.pipe(destinationStream)
                destinationPromise.then((res) => resolve([ key ]))
                .catch((err) => {
                    this.logger.error(err)
                    reject(err)
                })

                fileStream.on('limit', async () => {
                    bb.emit('error', new PayloadTooLarge({ message: 'Payload is larger than server limit' }))
                    await cleanUp()
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

    private deleteMediaFromS3(filePath: string) {
        return this.s3Client.send(new DeleteObjectCommand({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            Bucket: config.aws.bucket,
            Key: filePath,
        }))
    }

    private saveMediaToS3(filePath: string, mimeType: string): SaveToMedia {
        const destinationPath = path.join(s3UploadDestination, filePath)
        const destinationStream = new PassThrough()
        const uploadParams: PutObjectCommandInput = {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            Bucket: config.aws.bucket,
            Key: destinationPath,
            Body: destinationStream,
            ContentType: mimeType
        }

        const destinationPromise = new Promise((resolve, reject) => {
            const upload = new Upload({
                client: this.s3Client,
                params: uploadParams,
                queueSize: 8,
                partSize: 1024 * 1024 * 5,
                leavePartsOnError: false,
            })
            upload.done().then(value => resolve(value))
            .catch((err) => reject(err))
            // upload.on('httpUploadProgress', (porg) => console.log(porg))
        })

        const cleanUp = () => this.deleteMediaFromS3(destinationPath)
        
        return { destinationPromise, destinationStream, cleanUp }
    }

    private saveMediaToLocalDisk(filePath: string): SaveToMedia {
        const destinationPath = path.join(localUploadDestination, filePath)
        const destinationStream = fs.createWriteStream(destinationPath)
        const destinationPromise = new Promise((resolve, reject) => {
            destinationStream.on('finish', (resolve))
            destinationStream.on('error', reject)
        })

        const cleanUp = () => new Promise((resolve, reject) => {
            fs.rm(destinationPath, (err) => {
                if(err) reject(err)
                else resolve('File delete successfully')
            })
        })

        return { destinationPromise, destinationStream, cleanUp }
    }

    private createBusboy(headers: express.Request['headers']): busboy.Busboy {
        const bb = busboy({
            headers,
            limits: {
                files: 1,
                fileSize: MediaService.maxFileSize,
            }
        })

        return bb
    }
}

interface SaveToMedia { 
    destinationPromise: Promise<unknown>,
    destinationStream: NodeJS.WritableStream,
    cleanUp: () => Promise<unknown>
}
