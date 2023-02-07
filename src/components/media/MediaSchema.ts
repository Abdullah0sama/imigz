import { z } from 'zod'

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
    select: z.enum(MediaDefaultFields).array().min(1)
}).partial()


export type MediaSelectType = z.infer<typeof MediaSelectSchema>