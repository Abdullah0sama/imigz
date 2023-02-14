import { z } from 'zod'
import { ComparatorsSchema, SortOrder } from '../../common/schema'
import { castToArray } from '../../common/schema'

export const MediaDefaultFields = ['key', 'title', 'description', 'id', 'created_at'] as const


export const CreateMediaSchema = z.object({
    key: z.string().uuid(),
    title: z.string().max(40).optional(),
    description: z.string().max(150).optional(),
})

export type CreateMediaType = z.infer<typeof CreateMediaSchema>

export const updateMediaSchema = z.object({
    title: z.string().max(40).optional(),
    description: z.string().max(150).optional(),
}).partial()

export type UpdateMediaType = z.infer<typeof updateMediaSchema>


export const MediaSelectSchema = z.object({
    select: castToArray(z.enum(MediaDefaultFields).array().min(1))
}).partial()


export type MediaSelectType = z.infer<typeof MediaSelectSchema>

const otherMediaKeys = ['userRef', 'username'] as const

const MediaListingKeys = z.enum([...MediaDefaultFields, ...otherMediaKeys])

const WhereCondition = z.record(ComparatorsSchema, z.any())
const MediaWhereValues = z.record(MediaListingKeys, WhereCondition)
const MediaOrderValues = z.record(MediaListingKeys, SortOrder)

export const MediaListingOptionsSchema = z.object({
    select: castToArray(MediaListingKeys.array()),
    limit: z.coerce.number().min(1),
    offset: z.coerce.number().min(0),
    where: MediaWhereValues,
    orderby: MediaOrderValues
}).partial()

export type MediaListingType = z.infer<typeof MediaListingOptionsSchema>