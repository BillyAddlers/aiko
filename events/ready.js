module.exports = client => {
	console.log(`Logged as ${client.user.tag}`);
	getRandStats(client);
	client.setInterval(() => client.updateStats(), 60000);
}

function getRandStats(client){
	const statuses = require('../assets/json/status.json');
	client.setInterval(() => client.user.setActivity(`${client.config.prefix}help | ${statuses[Math.floor(Math.random()*statuses.length)%statuses.length]}`, {type: 'LISTENING'}),10000);
}