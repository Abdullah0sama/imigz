import { createApp } from './app';
import { config } from './config/config';
import http from 'http'




async function start() {
    const app = await createApp({});

    const server = http.createServer(app)
    const logger = app.internalModules.logger
    
    server.listen(config.port, () => {
        logger?.info(`App is running on port ${config.port}!`);
    })
    
    function shutdown() {
        server.close((err) => {
            if(err) {
                logger?.error(err)
                process.exitCode = 1
            }
        })
    }

    process.on('SIGINT', () => {
        logger?.info('SIGINT signal received: closing HTTP server')
        shutdown()
    })
        
    process.on('SIGTERM', () => {
        logger?.info('SIGTERM signal received: closing HTTP server')
        shutdown()
    })

}

start()
