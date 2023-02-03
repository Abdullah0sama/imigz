import { createApp } from './app';



async function start() {
    const app = await createApp();
    
    app.listen(3000, () => {
        app.internalModules.logger?.info('App is running');
    })
    
}

start()