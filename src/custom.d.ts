namespace Express {
    export interface Request {
        modifiedQuery: unknown
    }
    export interface Application {
        internalModules: {
            logger?: import('pino').BaseLogger
        }
    }
}
