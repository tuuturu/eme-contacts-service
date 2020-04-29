const express = require('express')
const { nanoid } = require('nanoid')

const { SaneRedis } = require('@tuuturu/toolbox-node/data')

const router = express.Router()
const redisClient = new SaneRedis.Client()

redisClient.connect(process.env.REDIS_URI)
	.then(() => console.log(`Successfully connected ${process.env.REDIS_URI}`))
	.catch(() => console.error(`Unable to connect to ${process.env.REDIS_URI}`))

function generateKey(principal) {
	return [
		principal,
		'contacts'
	].join(':')
}

router.get('/', async (req, res) => {
	const repo = redisClient.createCollectionRepository(generateKey(req.principal))
	let contacts = []

	try {
		contacts = await repo.getAll()
	}
	catch (error) {
		console.error(error)

		return res.status(500).end()
	}

	res.json(contacts).end()
})

router.post('/', async (req, res) => {
	const repo = redisClient.createCollectionRepository(generateKey(req.principal))
	const id = nanoid()

	const contact = Object.assign({}, req.body)
	contact.id = id

	try {
		await repo.set(contact.id, contact)
	}
	catch (error) {
		console.error(error)

		return res.status(500).end()
	}

	res.json(contact).end()
})

router.patch('/:id', async (req, res) => {
	const repo = redisClient.createCollectionRepository(generateKey(req.principal))

	const contact = req.body
	contact.id = req.params.id

	try {
		await repo.set(contact.id, contact)
	}
	catch (error) {
		console.error(error)

		return res.status(500).end()
	}

	res.json(contact).end()
})

router.delete('/:id', async (req, res) => {
	const repo = redisClient.createCollectionRepository(generateKey(req.principal))

	try {
		await repo.del(req.params.id)
	}
	catch (error) {
		console.error(error)

		return res.status(500).end()
	}

	res.status(200).end()
})

module.exports = router
