import { BaseLogger } from "pino";



export const fakePino: BaseLogger = {
    level: 'silent',
    fatal: () => {},
    info: () => {},
    debug: () => {},
    error: () => {},
    warn: () => {},
    trace: () => {},
    silent: () => {}
}