import { z } from 'zod'
export type UserTokenType = {
    userId: number,
    username: string
}


const SupportAuthServer = ['github'] as const

export const AuthServerParamsSchema = z.enum(SupportAuthServer)
export type AuthServerEnum = z.infer<typeof AuthServerParamsSchema>
