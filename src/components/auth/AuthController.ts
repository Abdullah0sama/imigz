import express, { Router } from 'express'
import { AuthService } from './AuthService'
import { AuthServerParamsSchema } from './AuthSchema'
import { UnauthorizedError } from '../../common/errors/publicErrors'
import { AuthServersHandler } from './AuthServerHandlers'
import { config } from '../../config/config'


export class AuthController {
    private authService: AuthService
    private router: express.Router
    constructor(authService: AuthService) {
        this.router = Router()
        this.authService = authService
    }

    setupRouter() {

        this.router.get('/register/:site', async (req, res) => {
            const { site } = req.params
            const authServer = await AuthServerParamsSchema.parseAsync(site)
            let callback = `${config.host}:${config.port}/auth/${authServer}`
            if(req.query.signIn === 'true') callback += '?signIn=true'
            res.status(303).redirect(AuthServersHandler[authServer].redirectURL(callback))
        })

        this.router.get('/:site', async (req, res) => {
            const { site } = req.params
            const AuthServer = await AuthServerParamsSchema.parseAsync(site)
            const code = req.query.code as string
            const isSignIn = req.query.signIn === 'true'
            if(!code) throw new UnauthorizedError({ message: 'Something went wrong' })
            const { token, user } = await this.authService.accessAccount(AuthServer, code, isSignIn)
            res.status(200).send({ data: { token }}).end()
        })
    }

    getRouter() {
        return this.router  
    }
}