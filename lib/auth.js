const axios = require('axios')
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');

async function getOIDCOptions(discovery_url) {
    const { data } = await axios.request({
        url: discovery_url,
        method: 'get',
    })

    return data
}

function setupMiddleware(oidc) {
    return jwt({
        secret: jwks.expressJwtSecret({
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 5,
            jwksUri: oidc.jwks_uri
        }),
        audience: 'account',
        issuer: oidc.issuer,
        algorithms: oidc.token_endpoint_auth_signing_alg_values_supported //['RS256']
    })
}

module.exports = {
    authMiddleware: setupMiddleware,
    getOIDCOptions
}
