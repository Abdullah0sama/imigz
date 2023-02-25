import express from 'express'

export const healthCheck = (req: express.Request, res: express.Response) => {
    res.send({
        timestamp: Date.now(),
        message: 'Ok',
        uptime: process.uptime(),
        pid: process.pid
    })
}