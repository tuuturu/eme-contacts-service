const cors = require('cors')
const express = require('express');
const logger = require('morgan');

const { getOIDCOptions, authMiddleware } = require('./auth')

const helperRouter = require('../feature/newfeature/router')

async function createApp() {
    const oidc_options = await getOIDCOptions(process.env.DISCOVERY_URL)

    const app = express();

    app.disable('etag')
    app.use(logger('dev'))
    app.use(cors())
    app.use(express.urlencoded({ extended: false }))
    app.use(express.json())

    app.get('/health', function (req, res) {
        res.sendStatus(200)
    });

    // Place routers before authMiddleware if you want to expose them without the need of a token

    app.use(authMiddleware(oidc_options))
    // Place routers after authMiddleware if you want your router to require a token
    app.use('/helper', helperRouter)

    app.use(function (err, req, res, next) {
        if (err.name === 'UnauthorizedError') {
            res.status(401).send('Invalid or missing token...')
        }
    })

    return app
}

module.exports = {
    createApp
}
