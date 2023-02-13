namespace Express {
    export interface Request {
        modifiedQuery: unknown,
        userToken: {
            userId: number,
            username: string
        }
    }
    export interface Application {
        internalModules: {
            logger?: import('pino').BaseLogger
        }
    }
}
