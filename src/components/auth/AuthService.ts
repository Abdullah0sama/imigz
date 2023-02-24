import { BaseLogger } from 'pino'
import { UserService } from '../users/UserService'
import { AuthServerEnum, UserTokenType } from './AuthSchema'
import { AuthServersHandler } from './AuthServerHandlers'
import { generateJwtToken } from '../../common/utils/jwtUtils'
import { config } from '../../config/config'
export class AuthService {
    constructor(private userService: UserService, private logger: BaseLogger) {
        this.userService = userService
    }
    async accessAccount(authServer: AuthServerEnum, code: string, isSignIn = false) {

        const authHandler = AuthServersHandler[authServer]
        const access_token = await authHandler.getAccessToken(code)
        const userInfo = await authHandler.getUserInfo(access_token)

        let user: UserTokenType
        if (isSignIn) {
            const [ foundUser ] = await this.userService.getUsers({ where: {email: {eq: userInfo.email }}}) 
            user = { username: foundUser.username, userId: foundUser.id }
        } else {
            const createdUser = await this.userService.createUser(userInfo)
            user = { username: createdUser.username, userId: createdUser.id }
        }

        const createdJWTToken = await this.generateToken(user)
        this.logger.info(user)
        this.logger.info(createdJWTToken)
        return { token: createdJWTToken, user }
    }

    private async generateToken(userToken: UserTokenType) {
        return generateJwtToken(userToken, '1h', config.JWT_SECRET)
    }
}

