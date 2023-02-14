import { z } from 'zod'
import { ComparatorsSchema, SortOrder } from '../../common/schema';
import { castToArray } from '../../common/schema';


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


const WhereCondition = z.record(ComparatorsSchema, z.any())
const UserWhereValues = z.record(userKeys, WhereCondition)
const UserOrderbyValues = z.record(userKeys, SortOrder)


export const UserListingSchema = z.object({
    select: castToArray(z.array(userKeys)),
    limit: z.coerce.number().min(1),
    offset: z.coerce.number().min(0),
    where: UserWhereValues,
    orderby: UserOrderbyValues
}).partial()

export type UserListingType = z.infer<typeof UserListingSchema>

export const UserSelectSchema = z.object({
    select: castToArray(userKeys.array().min(1)),
}).partial()

export type UserSelectType = z.infer<typeof UserSelectSchema>
