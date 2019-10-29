const { RichEmbed, Attachment } = require('discord.js');
const { exec } = require('child_process');

exports.run = async (client, msg, args, err) => {
	const now = Date.now();
	try{
		if(err) throw err
		if(!args.length) throw 'Exec command cannot execute without input!. You bbbaka...';
		exec(args.join(' '), async (stderr, stdout) => {
			if(stderr) return this.run(client, msg, args, stderr);
			if(!stdout.length) stdout = `\`\`\` \`\`\``
			else if(stdout.length > 2048) stdout = await hastebin(stdout)
			else stdout = `\`\`\`${stdout}\`\`\``;
			const embed = new RichEmbed()
			.setColor('GREEN')
			.setDescription(stdout)
			.setFooter(`⏱️ ${(Date.now()-now)/1000}s`);
			return msg.channel.send(embed);
		});
	}catch(e){
		e = e.stack || e;
		if(e.length > 2048) e = await hastebin(e)
		else e = `\`\`\`${e}\`\`\``;
		const embed = new RichEmbed()
		.setColor('RED')
		.setDescription(e)
		.setFooter(`⏱️ ${(Date.now()-now)/1000}s`);
		return msg.channel.send(embed);
	}
}

const { post } = require('node-superfetch');
async function hastebin(text){
	const { body } = await post('https://www.hastebin.com/documents').send(text);
	return `https://www.hastebin.com/${body.key}`;
}

exports.info = {
	name: 'exec',
	description: 'execute bash command',
	usage: 'exec <code>',
	aliases: ['$'],
	ownerOnly: true,
	authorPerm: [],
	clientPerm: ['EMBED_LINKS', 'ATTACH_FILES'],
	cooldown: 0
}