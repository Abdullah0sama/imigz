import { UnauthorizedError } from '../../common/errors/publicErrors'
import { config } from '../../config/config'
import { AuthServerEnum } from './AuthSchema'

export const AuthServersHandler: Record<AuthServerEnum, AuthHandlerInterface> = {
    'github': {
        redirectURL: (callback: string) => {
            const gitubConfig = config.authServers.github
            const { client_id } = gitubConfig
            const scopes = encodeURIComponent('user:email')
            callback = encodeURIComponent(callback)
            const redirectURL = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=${scopes}&redirect_uri=${callback}`
            return redirectURL
        },

        getAccessToken: async (code: string) => {
            const { client_id, client_secret } = config.authServers.github
            const redirectUri = `${encodeURIComponent(config.CALLBACK)}`

            const urlEncode = `client_id=${client_id}&client_secret=${client_secret}&code=${code}&redirect_uri=${redirectUri}`
            const oauthRes = await fetch('https://github.com/login/oauth/access_token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                body: urlEncode,
            })
            const data = await oauthRes.json()
            const { access_token } = data

            return access_token
        },

        getUserInfo: async (access_token: string) => {
            const res = await fetch('https://api.github.com/user', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })
        
            const userInfo = await res.json()
            const { name, login: username }: { name: string, login: string } = userInfo 

            const userEmailRes = await fetch('https://api.github.com/user/emails', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })
            const emails: GithubEmailsInterface[] = await userEmailRes.json()
            const [ { email: verifiedPrimaryEmail } ] = emails.filter((emailInfo) => emailInfo.primary == true && emailInfo.verified == true)

            if(!verifiedPrimaryEmail) throw new UnauthorizedError({ message: 'Something went wrong during authorizing!' })

            return { email: verifiedPrimaryEmail, name, username }
        }
    }
}

interface AuthHandlerInterface {
    redirectURL: (callback: string) => string,
    getUserInfo: (access_token: string) => Promise<AuthUserInfo>,
    getAccessToken: (code: string) => Promise<string>
}

interface AuthUserInfo {
    username: string,
    email: string,
    name: string
}
interface GithubEmailsInterface {
    email: string,
    primary: boolean,
    visibility: boolean,
    verified: boolean,
}