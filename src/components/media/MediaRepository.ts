import { BaseLogger } from 'pino'
import { Database } from '../../config/database/DatabaseTypes'
import { Kysely, NoResultError } from 'kysely'
import { CreateMediaType, MediaDefaultFields, MediaListingType, MediaSelectType, UpdateMediaType } from './MediaSchema'
import { DatabaseError } from 'pg'
import { CreationError, NotFoundError } from '../../common/errors/internalErrors'
import { ComparatorsExpression } from '../../common/schema'


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
            } else if(err instanceof DatabaseError && err.message.includes('invalid input syntax for type uuid')) {
                // postgres throws an error when key is not uuid, which should result to Not found error to end user
                throw new NotFoundError(`Failed to find media '${key}'`)
            } else {
                throw err
            }
        }
    }

    async listMedia(listingOptions: MediaListingType) {
        const { where: whereOptions, 
            limit: limitOptions, 
            offset: offsetOptions, 
            select: selectOptions, 
            orderby: orderbyOptions } = listingOptions 

        try {
            let query = this.db.selectFrom('media')

            // Do with select username is not supported yet

            const filteredSelectFields = (selectOptions) ?
                selectOptions.filter(field => field != 'username') as Exclude<typeof selectOptions[number], 'username'>[]
                : MediaDefaultFields

            query = query.select(filteredSelectFields)
            
            if(whereOptions) {
                Object.keys(whereOptions).forEach((key) => {
                    const typedKey = key as keyof typeof whereOptions
                    if(typedKey == 'username') return;
                    const conditionExpression = whereOptions[typedKey]
                    if(!conditionExpression) return;
                    const [condition] = Object.keys(conditionExpression) as (keyof typeof conditionExpression)[] 
    
                    query = query.where(typedKey, ComparatorsExpression[condition], conditionExpression[condition])
                })
            }

            if(orderbyOptions) {
                Object.keys(orderbyOptions).forEach((key) => {
                    const typedKey = key as keyof typeof whereOptions
                    if(typedKey == 'username') return;
                    query = query.orderBy(typedKey, orderbyOptions[typedKey])
                })
            }

                            
            if(limitOptions) query = query.limit(limitOptions)
            if(offsetOptions) query = query.offset(offsetOptions)

            const listingData = await query.execute()
            return listingData
        } catch(err) {
            this.logger.error(err, `listMedia: error while trying to get list '${listingOptions}'`)

        }
    }

    async createMedia(userId: number | null, mediaInfo: CreateMediaType) {
        try {
            const { id } = await this.db.insertInto('media')
                .values({...mediaInfo, userRef: userId})
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

            if(!numUpdatedRows) throw new NotFoundError(`Failed to find media '${key}'`)

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