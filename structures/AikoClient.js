const { Client, Collection } = require('discord.js');
const { Commands, Aliases } = require('../util/moduleHandler.js');
const { UseprofEnmap } = require('./Enmap.js');

class AikoClient extends Client {
	constructor(...args){
		super(...args);
		
		this.commands = Commands;
		this.aliases = Aliases;
		this.config = require('../config.json');
		this.cooldowns = new Collection();
		this.userprof = new UseprofEnmap({ name: 'userprof' });
		this.health = Object.seal({
			cpu: new Array(96).fill(0),
			prc: new Array(96).fill(0),
			ram: new Array(96).fill(0),
		});
	}
	
	updateStats() {
		const { heapTotal, heapUsed } = process.memoryUsage();
		const { loadavg } = require('os');
		this.health.cpu.shift();
		this.health.cpu.push(((loadavg()[0] * 10000) | 0) / 100);
		this.health.prc.shift();
		this.health.prc.push(((100 * (heapTotal / 1048576)) | 0) / 100);
		this.health.ram.shift();
		this.health.ram.push(((100 * (heapUsed / 1048576)) | 0) / 100);
	}
}

module.exports = AikoClient;