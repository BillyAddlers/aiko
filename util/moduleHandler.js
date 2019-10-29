const { Collection } = require('discord.js');
const { join } = require('path');
const { readdirSync } = require('fs');

const Commands = new Collection();
const Aliases = new Collection();

const modules = readdirSync(join(__dirname, '..', 'commands'));
console.log(`Load ${modules.length} modules`);

for(const module of modules){
	console.log(`Loading module ${module}...`);
	const commandFile = readdirSync(join(__dirname, '..', 'commands', module));
	for(const file of commandFile){
		let cmd = require(`../commands/${module}/${file}`);
		console.log(`Loading command ${cmd.info.name}`);
		cmd.info.category = module;
		Commands.set(cmd.info.name.toLowerCase(), cmd);
		for(const alias of cmd.info.aliases){
			Aliases.set(alias.toLowerCase(), cmd.info.name.toLowerCase());
		}
	}
}

module.exports = { Commands, Aliases }