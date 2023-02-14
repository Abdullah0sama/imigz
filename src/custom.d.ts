namespace Express {
    export interface Request {
        modifiedQuery: unknown,
        userToken: import('../src/components/auth/AuthSchema').UserTokenType
    }
    export interface Application {
        internalModules: {
            logger?: import('pino').BaseLogger
        }
    }
}
