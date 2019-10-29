const { RichEmbed } = require('discord.js');

exports.run = async (client, msg, args) => {
	let user = msg.mentions.users.first() || client.users.get(args[0]);
	if(!user) user = msg.author;
	try{
		const embed = new RichEmbed()
		.setColor(0x007EFF)
		.setDescription(`${user.tag}\n[Avatar URL](${user.displayAvatarURL})`)
		.setImage(user.displayAvatarURL);
		return msg.channel.send(embed);
	}catch(e){
		return msg.channel.send(`an error occured \`\`\`${e.stack}\`\`\``);
	}
}

exports.info = {
	name: 'avatar',
	description: 'show avatar url',
	usage: 'avatar [user]',
	aliases: ['av'],
	ownerOnly: false,
	authorPerm: [],
	clientPerm: ['EMBED_LINKS'],
	cooldown: 0
}