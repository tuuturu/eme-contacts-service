const axios = require('axios')

class AuthorizationError extends Error {
	constructor(...args) {
		super(...args)
	}
}

async function getOIDCOptions(discovery_url) {
	const { data } = await axios.request({
		url: discovery_url,
		method: 'get',
	})

	return data
}

async function validateToken(url, authorization) {
	if (!authorization) throw new AuthorizationError()

	try {
		const { data } = await axios.request({
			url,
			method: 'get',
			headers: { authorization }
		})

		return data
	}
	catch (error) {
		if (error.response) {
			if (error.response.statusCode === 401) throw new AuthorizationError()
		}
		else throw error
	}
}

function setupMiddleware(oidc) {
	return async (req, res, next) => {

		try {
			req.user = await validateToken(oidc.userinfo_endpoint, req.headers.authorization)

			req.principal = req.user.sub
		}
		catch (error) {
			return next(error)
		}

		next()
	}
}

module.exports = {
	AuthorizationError,
	authMiddleware: setupMiddleware,
	getOIDCOptions
}
