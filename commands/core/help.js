const { RichEmbed } = require('discord.js');

exports.run = async (client, msg, args) => {
	try{
		if(args[0]){
			let cmd = client.commands.get(args[0]) || client.commands.get(client.aliases.get(args[0]));
			cmd = cmd.info;
			const embed = new RichEmbed()
			.setColor('RANDOM')
			.setTitle(`Help Menu for ${cmd.name}`)
			.setDescription(cmd.description || 'No description')
			.addField('Category', cmd.category)
			.addField('Usage', cmd.usage || 'No usage')
			.addField('Aliases', cmd.aliases.join(', ') || 'No aliases')
			.addField('Your Perm', cmd.authorPerm.join(', ') || 'No perm')
			.addField('My Perm', cmd.clientPerm.join(', ') || 'No perm')
			.addField('Cooldown', cmd.cooldown || 0);
			return msg.channel.send(embed);
		}
		const category = Array.from(new Set(client.commands.map(x => x.info.category)));
		const embed = new RichEmbed()
		.setColor('RANDOM')
		.setFooter(`About ${category.length} modules, ${client.commands.size} commands`);
		for(const cat of category){
			embed.addField(`» **${toProper(cat)}**`, client.commands.filter(x => x.info.category === cat).map(x => `\`${x.info.name}\``).join(', '))
		}
		return msg.channel.send(embed);
	}catch(e){
		return msg.channel.send(`an error occured \`\`\`${e.stack}\`\`\``);
	}
}

function toProper(str){
	str = str.toLowerCase().split('');
	str[0] = str[0].toUpperCase();
	return str.join('');
}

exports.info = {
	name: 'help',
	description: 'show help',
	usage: 'help [commands]',
	aliases: ['h'],
	ownerOnly: false,
	authorPerm: [],
	clientPerm: ['EMBED_LINKS'],
	cooldown: 0
}