const { join } = require('path');
const { readdirSync } = require('fs');

module.exports = client => {
	const events = readdirSync(join(__dirname, '..', 'events'));
	for(const event of events){
		const name = event.split('.')[0];
		const file = require(`../events/${event}`);
		client.on(name, (...args) => file(client, ...args));
	}
}