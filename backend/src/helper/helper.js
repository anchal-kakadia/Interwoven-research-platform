import * as dotevnv from 'dotenv'

dotevnv.config()

export const assignEnvironmentVariable = (key) =>{
    if(!process.env[key])
    {
        console.error(`[service.helper] ${key} is not set`)
        return `[service.helper] ${key} is not set`
    } else {
        return process.env[key]
    }
}