
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

export class UnsupportedMediaType extends HTTPError {
    constructor(params: ErrorParams) {
        super({
            statusCode: 415,
            message: params.message
        })
    }
}

export class PayloadTooLarge extends HTTPError {
    constructor(params: ErrorParams) {
        super({
            statusCode: 413,
            message: params.message
        })
    }
}

export class UnauthorizedError extends HTTPError {
    constructor(params: ErrorParams) {
        super({
            statusCode: 401,
            message: params.message
        })
    }
}

export class ForbiddenError extends HTTPError {
    constructor(params: ErrorParams) {
        super({
            statusCode: 403,
            message: params.message
        })
    }
}