if (process.env.ELASTIC_APM_SERVER_URL) require('elastic-apm-node').start()

const express = require('express');
const logger = require('morgan');

const { middleware } = require('@tuuturu/toolbox-node/authentication')

const contactsRouter = require('../feature/contacts/router')

async function createApp() {
    const app = express();

    app.disable('etag')
    app.use(logger('dev'))
    app.use(express.urlencoded({ extended: false }))
    app.use(express.json())

    app.get('/health', function (req, res) {
        res.sendStatus(200)
    });

    // Place routers before authMiddleware if you want to expose them without the need of a token

    app.use(middleware.authenticationMiddleware(`${process.env.GATEKEEPER_URL}/userinfo`))
    // Place routers after authMiddleware if you want your router to require a token
    app.use('/contacts', contactsRouter)

    app.use(function (err, req, res, next) {
        if (err instanceof middleware.AuthorizationError) {
            res.status(401).send('Invalid or missing token...')
        }
        else {
            console.error('Something bad happened: ', err)
            res.status(500).send('Server\'s burning. Please stay at a safe distance')
        }
    })

    return app
}

module.exports = {
    createApp
}
