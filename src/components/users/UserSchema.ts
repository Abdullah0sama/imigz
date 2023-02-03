import { z } from 'zod'


export const Username = z.number();

export const CreateUserSchema = z.object({
    username: z.string().min(5).max(30).regex(/[a-zA-Z0-9_]*/),
    name: z.string().min(1).max(40),
    email: z.string().email(),
    bio: z.string().optional(),
})

export type CreateUserType = z.infer<typeof CreateUserSchema>

export const UpdateUserSchema = CreateUserSchema.partial()

export type UpdateUserType = z.infer<typeof UpdateUserSchema>

const userKeys = CreateUserSchema.keyof()

export const DefaultUserKeys: (keyof CreateUserType)[] = ['name', 'username', 'bio', 'email'];

export const SortOrder = z.enum([
    'asc',
    'desc'
])

export const ComparatorsSchema = z.enum([
    'gte', 
    'gt', 
    'lte', 
    'lt', 
    'eq', 
    'neq'
])

export type ComparatorsEnum = z.infer<typeof ComparatorsSchema>

const WhereCondition = z.record(ComparatorsSchema, z.any())
const UserWhereValues = z.record(userKeys, WhereCondition)
const UserOrderbyValues = z.record(userKeys, SortOrder)

export const UserListingSchema = z.object({
    select: userKeys.array(),
    limit: z.number().min(1),
    offset: z.number().min(0),
    where: UserWhereValues,
    orderby: UserOrderbyValues
}).partial()

export type UserListingType = z.infer<typeof UserListingSchema>

export const UserSelectSchema = z.object({
    select: userKeys.array().min(1),
}).partial()

export type UserSelectType = z.infer<typeof UserSelectSchema>

type ComparatorSymbols = '>=' | '=' | '<=' | '<' | '!=' | '>';
export const ComparatorsExpression: Record<ComparatorsEnum, ComparatorSymbols> = {
    'gte': '>=',
    'gt': '>',
    'lte': '<=',
    'lt': '<',
    'eq': '=',
    'neq': '!=',
}