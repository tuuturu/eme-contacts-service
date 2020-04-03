const express = require('express')
const { nanoid } = require('nanoid')

const { getContactsRepository } = require('../common/db')

const router = express.Router()

router.get('/', async (req, res) => {
	const contactsRepository = await getContactsRepository()
	let contacts = []

	try {
		contacts = await contactsRepository.getAll()
	}
	catch (error) {
		console.error(error)

		return res.status(500).end()
	}

	res.json(contacts).end()
})

router.post('/', async (req, res) => {
	const contactsRepository = await getContactsRepository()
	const id = nanoid()

	const contact = Object.assign({}, req.body)
	contact.id = id

	try {
		await contactsRepository.set(contact.id, contact)
	}
	catch (error) {
		console.error(error)

		return res.status(500).end()
	}

	res.json(contact).end()
})

router.patch('/:id', async (req, res) => {
	const contactsRepository = await getContactsRepository()

	const contact = req.body
	contact.id = req.params.id

	try {
		contactsRepository.set(contact.id, contact)
	}
	catch (error) {
		console.error(error)

		return res.status(500).end()
	}

	res.json(contact).end()
})

router.delete('/:id', async (req, res) => {
	const contactsRepository = await getContactsRepository()

	try {
		await contactsRepository.del(req.params.id)
	}
	catch (error) {
		console.error(error)

		return res.status(500).end()
	}

	res.status(200).end()
})

router.post('/batch', async (req, res) => {
	const contactsRepository = await getContactsRepository()

	const contacts = req.body

	try {
		const operations = []

		for (let contact of contacts)
			operations.push(contactsRepository.set(contact.id, contact))

		await Promise.all(operations)
	}
	catch (error) {
		console.error(error)

		return res.status(500).end()
	}

	res.status(200).end()
})

module.exports = router
