if (process.env.ELASTIC_APM_SERVER_URL) require('elastic-apm-node').start()

const express = require('express');
const logger = require('morgan');

const { getOIDCOptions, authMiddleware } = require('./auth')

const contactsRouter = require('../feature/contacts/router')
const { AuthorizationError } = require('./auth')

async function createApp() {
    const oidc_options = await getOIDCOptions(process.env.DISCOVERY_URL)

    const app = express();

    app.disable('etag')
    app.use(logger('dev'))
    app.use(express.urlencoded({ extended: false }))
    app.use(express.json())

    app.get('/health', function (req, res) {
        res.sendStatus(200)
    });

    // Place routers before authMiddleware if you want to expose them without the need of a token

    app.use(authMiddleware(oidc_options))
    // Place routers after authMiddleware if you want your router to require a token
    app.use('/contacts', contactsRouter)

    app.use(function (err, req, res, next) {
        if (err instanceof AuthorizationError) {
            res.status(401).send('Invalid or missing token...')
        }
    })

    return app
}

module.exports = {
    createApp
}
