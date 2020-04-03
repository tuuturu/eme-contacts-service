const csv = require('csv-parse/lib')

const G_TO_LOCAL_MAP = Object.freeze({
	'Given Name': 'first_name',
	'Family Name': 'last_name',
	'E-mail': 'email',
	Phone: 'phone'
})

function generateHeaderMap(conversion_map, headers) {
	const map = {}

	headers.forEach((item, index) => {
		if (headers[index] in conversion_map) {
			map[index] = conversion_map[headers[index]]

			return
		}

		const parts = headers[index].split(' ')
		const key = parts[0]
		const type = parts.slice(-1)[0]

		if (key in conversion_map && type === 'Value')
			map[index] = conversion_map[key]
	})

	return map
}

function contactReducer(headerMap) {
	return (contact, property, index) => {
		if (index in headerMap) {
			const key = headerMap[index]

			if (!contact[key]) contact[key] = []
			else if (typeof contact[key] !== 'object') contact[key] = [contact[key]]

			let value = []

			if (property.indexOf(':::') >= 0) value.push(...property.split(':::'))
			else value.push(property)

			contact[key].push(...value.filter(item => item.length > 0))

			if (contact[key].length === 0) delete contact[key]
			else if (contact[key].length === 1) contact[key] = contact[key][0]
		}

		return contact
	}
}

function parseCSVContacts(raw_input) {
	return new Promise((resolve, reject) => {
		csv(raw_input, (err, result) => {
			if (err) return reject(err)

			let headerMap = null
			const contacts = []

			result.forEach(line => {
				if (!headerMap) {
					headerMap = generateHeaderMap(G_TO_LOCAL_MAP, line)

					return
				}

				const parsed_contact = line.reduce(contactReducer(headerMap), {})

				contacts.push(parsed_contact)
			})

			resolve(contacts)
		})
	})
}

module.exports = {
	parseCSVContacts
}
