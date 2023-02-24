

export const getMandatory = (envName: string): string => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const envValue = getEnvValue(envName)!
    return envValue
}


export const getMandatoryInt = (envName: string): number => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const envValue = getEnvValue(envName)!
    return parseInt(envValue)
}

export const getOptional = (envName: string, defaultValue: string) => {
    const envValue = getEnvValue(envName, false)
    return (envValue) ? envValue : defaultValue
}

export const getOptionalBoolean = (envName: string, defaultValue: boolean) => {
    const envValue = getEnvValue(envName, false)
    return (envValue) ? envValue === 'true' : defaultValue
}

export const undefinedIfDevelopment = <T>(val: T) => {
    return (isDevelopment) ? undefined : val
}
const isDevelopment= process.env['NODE_ENV'] === 'development'

const getEnvValue = (envName: string, isMandatory = true) => {
    const envValue = process.env[envName]
    if(isMandatory && !envValue) throw new Error(`Environment variable '${envName}' not found!`)
    return envValue
}

