
type AbstractErrorParams = {
    message: string
    statusCode: number
}

type ErrorParams = {
    message: string
}

export class HTTPError extends Error {
    readonly statusCode: number

    constructor(params: AbstractErrorParams) {
        super(params.message)
        this.statusCode = params.statusCode
    }
}

export class EntityNotFoundError extends HTTPError {
    constructor(params: ErrorParams) {
        super({
            statusCode: 404,
            message: params.message
        })
    }
}

export class EntityNotCreatedError extends HTTPError {
    constructor(params: ErrorParams) {
        super({
            statusCode: 400,
            message: params.message
        })
    }
}