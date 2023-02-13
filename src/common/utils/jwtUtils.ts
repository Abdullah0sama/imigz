
import { sign, verify } from 'jsonwebtoken'
import { EmptyTokenError, TokenVerifyError } from '../errors/internalErrors'


export function generateJwtToken(payload: Record<string, unknown>, ttl: string, secret: string): Promise<string> {
    return new Promise((resolve, reject) => {
        sign(payload, 
            secret, 
            {
                expiresIn: ttl
            }, (err, encoded) => {
                if(err) return reject(err)
                if(!encoded) return reject(new EmptyTokenError())
                resolve(encoded)
            })
    })
}


export function decodeJwtToken(token: string, secret: string) {
    return new Promise((resolve, reject) => {
        verify(token, secret, (err, decoded) => {
            if(err) {
                return reject(new TokenVerifyError( ))
            }
            if(!decoded) return reject(new EmptyTokenError())
            resolve(decoded)
        })
    })
} 