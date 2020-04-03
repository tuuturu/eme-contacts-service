const { SaneRedisClient } = require('@tuuturu/sane-redis-wrapper')

let instance = null

async function getInstance() {
	if (!instance) instance = new SaneRedisClient()

	await instance.connect(process.env.REDIS_URL)

	return instance
}

async function getContactsRepository() {
	const instance = await getInstance()

	return instance.createCollectionRepository('contacts')
}

module.exports = {
	getContactsRepository
}
