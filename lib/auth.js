const axios = require('axios')

async function getOIDCOptions(discovery_url) {
	const { data } = await axios.request({
		url: discovery_url,
		method: 'get',
	})

	return data
}

async function validateToken(url, authorization) {
	const { data } = await axios.request({
		url,
		method: 'get',
		headers: { authorization }
	})

	return data
}

function setupMiddleware(oidc) {
	return async (req, res, next) => {
		try {
			req.user = await validateToken(oidc.userinfo_endpoint, req.headers.authorization)

			req.principal = req.user.sub
		}
		catch (error) {
			if (error.response.statusCode === 401)
				return next(new Error('UnathorizedError'))
		}

		next()
	}
}

module.exports = {
	authMiddleware: setupMiddleware,
	getOIDCOptions
}
