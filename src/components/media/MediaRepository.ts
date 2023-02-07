import { BaseLogger } from 'pino'
import { Database } from '../../config/database/DatabaseTypes'
import { Kysely, NoResultError } from 'kysely'
import { CreateMediaType, MediaDefaultFields, MediaSelectType, UpdateMediaType } from './MediaSchema'
import { DatabaseError } from 'pg'
import { CreationError, NotFoundError } from '../../common/errors/internalErrors'


export class MediaRepository {
    private readonly db: Kysely<Database>
    private readonly logger: BaseLogger

    constructor(db: Kysely<Database>, logger: BaseLogger) {
        this.db = db
        this.logger = logger
    }


    async getMedia(key: string, mediaSelectOptions: MediaSelectType) {
        try {

            const selectedFields = mediaSelectOptions.select || MediaDefaultFields
            const mediaData = await this.db.selectFrom('media')
                .select(selectedFields)
                .where('key', '=', key)
                .executeTakeFirstOrThrow()

            return mediaData

        } catch (err) {
            this.logger.error(err, `getMedia: error when getting key '${key}'`)
            if(err instanceof NoResultError) {
                throw new NotFoundError(`Failed to find media '${key}'`)
            } else {
                throw err
            }
        }
    }

    async createMedia(mediaInfo: CreateMediaType) {
        try {
            const { id } = await this.db.insertInto('media')
                .values(mediaInfo)
                .returning(['id'])
                .executeTakeFirstOrThrow()
            return { id }

        } catch (err) {
            this.logger.error(err, 'createMedia: Failed to save media info');
            if(err instanceof DatabaseError && err.message.includes('duplicate')) {
                throw new CreationError(`Failed To create media because '${err.constraint?.split('_')[1]}' value already exists`)
            }
            throw err
        }
    }

    async updateMedia(key: string, mediaInfo: UpdateMediaType) {
        try {
            const { numUpdatedRows } = await this.db.updateTable('media')
                .set(mediaInfo)
                .where('key', '=', key)
                .executeTakeFirst()

            if(!numUpdatedRows) throw new NotFoundError(`Couldn't find media '${key}'`)

        } catch (err) {
            this.logger.error(err, 'updateMedia: Failed to save media info');
            throw err;
        }
    }

    async deleteMedia(key: string) {
        try {
            await this.db.deleteFrom('media')
                .where('key', '=', key)
                .execute()

        } catch (err) {
            this.logger.error(err, 'deleteMedia: Failed to delete media info');
            throw err;
        }
    }

}