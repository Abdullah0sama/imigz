import { ZodError } from 'zod'
import { HTTPError } from './publicErrors'




export const errorResolver = (error: unknown): ResolvedError => {

    if(error instanceof HTTPError) {
        return {
            statusCode: error.statusCode,
            payload: {
                message: error.message
            }
        }
    }

    if(error instanceof ZodError) {
        return {
            statusCode: 400,
            payload: {
                message: 'Invalid params',
                details: error.issues
            }
        }
    }

    return {
        statusCode: 500,
        payload: {
            message: 'Internal Server Error'
        }
    }
}

type ResolvedError = {
    statusCode: number,
    payload: {
        message: string,
        details?: object
    }
}