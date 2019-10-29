const { join } = require('path');
const { readdirSync } = require('fs');

exports.run = async (client, msg, args) => {
	try{
		const modules = readdirSync(join(__dirname, '..', '..', 'commands'));
		for(const module of modules){
			const commandFile = readdirSync(join(__dirname, '..', '..', 'commands', module));
			for(const file of commandFile){
				let cmd = require(`../../commands/${module}/${file}`);
				cmd.info.category = module;
				client.commands.set(cmd.info.name.toLowerCase(), cmd);
				for(const alias of cmd.info.aliases){
					client.aliases.set(alias.toLowerCase(), cmd.info.name.toLowerCase());
				}
			}
		}
		return msg.channel.send('✅ **| Succes reload all modules**');
	}catch(e){
		return msg.channel.send(`an error occured \`\`\`${e.stack}\`\`\``);
	}
}

exports.info = {
	name: 'reload',
	description: 'reload all modules',
	usage: 'reload',
	aliases: [],
	ownerOnly: true,
	authorPerm: [],
	clientPerm: [],
	cooldown: 0
}