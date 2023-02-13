import { createApp } from './app';
import { config } from './config/config';



async function start() {
    const app = await createApp({});
    
    app.listen(config.port, () => {
        app.internalModules.logger?.info(`App is running on port ${config.port}!`);
    })
    
}

start()