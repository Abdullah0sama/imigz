import { DeleteObjectCommand, PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { PassThrough } from 'node:stream'
import { config } from '../../../config/config'
import * as path from 'path'
import { MediaHandler, SaveMediaInterface } from './interface'



export class S3Service implements MediaHandler {
    private readonly s3UploadDestination = path.join('uploads');
    constructor(private readonly s3Client: S3Client) {
    }


    deleteMedia(filePath: string) {
        return this.s3Client.send(new DeleteObjectCommand({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            Bucket: config.aws.bucket,
            Key: filePath,
        }))
    }

    saveMedia(filePath: string, mimeType: string): SaveMediaInterface {
        const destinationPath = path.join(this.s3UploadDestination, filePath)
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
        
        return { destinationPromise, destinationStream }
    }
}