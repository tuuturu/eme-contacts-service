const fs = require('fs')
const path = require('path')
const { nanoid } = require('nanoid')

const { getContactsRepository } = require('../feature/common/db')
const { parseCSVContacts } = require('./contact_parser')

if (process.argv.length !== 3) {
	console.error('An unreasonable amount of arguments was applied. Only a filename is expected')

	process.exit(1)
}

const filePath = path.join(__dirname, process.argv[2])

function readFile(path) {
	return new Promise((resolve, reject) => {
		fs.readFile(path, { encoding: 'utf-8' }, (err, data) => {
			if (err) reject(err)
			else resolve(data)
		})
	})
}

function fixBrokenValue(value) {
	if (value instanceof Array) return value.join(';')

	console.log(`Unable to find a solution for: "${value}"`)
	return 'ERR'
}

function findBrokenContacts(contacts) {
	return new Promise(resolve => {
		contacts.forEach(contact => {
			Object.keys(contact).forEach(attr => {
				if (typeof contact[attr] !== 'string')
					contact[attr] = fixBrokenValue(contact[attr])
			})
		})

		resolve(contacts)
	})
}

function sendToRedis(contacts) {
	return new Promise(async resolve => {
		const repo = await getContactsRepository()

		const operations = []

		contacts.forEach(contact => {
			contact.id = nanoid()

			operations.push(repo.set(contact.id, contact))
		})

		await Promise.all(operations)

		resolve(operations.length)
	})
}

readFile(filePath)
	.then(parseCSVContacts)
	.then(findBrokenContacts)
	.then(sendToRedis)
	.then(n => console.log(`completed import of ${n} contacts`))
	.catch(console.error)
