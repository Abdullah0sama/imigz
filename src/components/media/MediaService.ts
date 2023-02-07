import { BaseLogger } from 'pino';
import busboy from 'busboy';
import express from 'express'
import * as fs from 'fs'
import * as path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { PayloadTooLarge, UnsupportedMediaType } from '../../common/errors/publicErrors';
import { errorResolver } from '../../common/errors/errorResolver';
import { DeleteObjectCommand, PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { MediaRepository } from './MediaRepository';
import { PassThrough } from 'node:stream'

const uploadDestination = path.join(__dirname, '../../../', 'uploads')
const s3UploadDestination = path.join('uploads');

export class MediaService {
    private static readonly acceptedFiles = ['jpeg', 'jpg', 'png', 'gif']
    private static readonly maxFileSize = 1024 * 1024 * 15;

    private readonly logger: BaseLogger
    private readonly s3Client: S3Client
    private readonly mediaRepositroy: MediaRepository

    constructor(s3Client: S3Client, mediaRepository: MediaRepository, logger: BaseLogger) {
        this.logger = logger
        this.s3Client = s3Client
        this.mediaRepositroy = mediaRepository

        if(!fs.existsSync(uploadDestination))
            fs.mkdirSync(uploadDestination)
    }

    saveMedia(headers: express.Request['headers'], res: express.Response): NodeJS.WritableStream {
        
        const key = uuidv4();
        const successHandler = async () => {
            await this.mediaRepositroy.createMedia({ key })
            return res.status(303).send({ data: {  key }})
        }

        
        const bb = this.createBusboy(headers)
        
        bb.on('file', async (fileName, fileStream, info) => {
            this.logger.info(`file name ${fileName}, info: ${ info.filename }, ${ info.mimeType }`)
            
            const [ mimePrefix, fileType ] = info.mimeType.split('/')
            
            if(mimePrefix != 'image' || !MediaService.acceptedFiles.includes(fileType)) {
                fileStream.resume()
                bb.emit('error',new UnsupportedMediaType({ message: 'Type Provided is not one of the supported files' }))
                return
            }
            
            const destinationFileName = `${key}.${fileType}`
            const filePathSave = path.join(s3UploadDestination, destinationFileName)

            const { uploadPromise, passThrough } = this.saveMediaToS3(filePathSave)

            fileStream.pipe(passThrough)

            fileStream.on('limit', async () => {
                bb.emit('error', new PayloadTooLarge({ message: 'Payload is larger than server limit' }))
                await this.deleteMediaFromS3(filePathSave)
            })
            
            fileStream.on('close', () => {
                this.logger.info('file finished')
            })

            try {

                await uploadPromise.done()
                await successHandler()

            } catch(err)  {
                this.logger.error(err, 'saveMedia: failed to save media')
            }

        })

        bb.on('error', (err) => {
            this.logger.info('busboy error')
            const resData = errorResolver(err)
            res.status(resData.statusCode).send(resData.payload)
        })

        
        console.log('down here')
        return bb
    }

    private deleteMediaFromS3(filePath: string) {
        return this.s3Client.send(new DeleteObjectCommand({
            Bucket: '699144434216-testing',
            Key: filePath,
        }))
    }

    private saveMediaToS3(filePath: string) {
        const passThrough = new PassThrough()
        const uploadParams: PutObjectCommandInput = {
            Bucket: '699144434216-testing',
            Key: filePath,
            Body: passThrough,
        }

        const upl = new Upload({
            client: this.s3Client,
            params: uploadParams,
            queueSize: 4,
            leavePartsOnError: false,
        })

        return { uploadPromise: upl, passThrough}
    }

    private saveMediaToLocalDisk(headers: express.Request['headers'], res: express.Response): NodeJS.WritableStream {

        const bb = this.createBusboy(headers)

        bb.on('file', (fileName, fileStream, info) => {
            this.logger.info(`file name ${fileName}, info: ${ info.filename }, ${ info.mimeType }`)
            
            const [ mimePrefix, fileType ] = info.mimeType.split('/')
            
            if(mimePrefix != 'image' || !MediaService.acceptedFiles.includes(fileType)) {
                fileStream.resume()
                bb.emit('error',new UnsupportedMediaType({ message: 'Type Provided is not one of the supported files' }))
                return
            }

            const destinationFileName = `${uuidv4()}.${fileType}`
            const filePathSave = path.join(uploadDestination, destinationFileName)
            const destination = fs.createWriteStream(filePathSave)
            fileStream.pipe(destination)

            fileStream.on('limit', () => {
                fs.rm(filePathSave, (err) => {
                    if(err) this.logger.error(err, `Something went wrong while deleting file ${destinationFileName}`)
                })
                bb.emit('error', new PayloadTooLarge({ message: 'Payload is larger than server limit' }))
            })

            fileStream.on('error', (err) => {
                bb.emit('error', err)
            })

            fileStream.on('close', () => {
                this.logger.info('file finished')
            })
        })

        bb.on('error', (err) => {
            this.logger.info('busboy error')
            const resData = errorResolver(err)
            res.status(resData.statusCode).send(resData.payload)
        })

        bb.on('close', () => {
            this.logger.info('bb finished')
        })

        return bb
    }

    private createBusboy(headers: express.Request['headers']): busboy.Busboy {
        const bb = busboy({
            headers,
            limits: {
                files: 1,
                fileSize: MediaService.maxFileSize,
            }
        })

        bb.on('close', () => {
            this.logger.info('bb finished')
        })

        return bb
    }
}

