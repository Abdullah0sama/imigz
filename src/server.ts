import { createApp } from './app';



async function start() {
    const app = await createApp();
    
    app.listen(3000, () => {
        console.log('App is running');
    })
    
}

start()