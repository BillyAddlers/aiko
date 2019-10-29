const { RichEmbed, Attachment } = require('discord.js');

exports.run = async (client, msg, args) => {
	const now = Date.now();
	try{
		if(!args.length) throw new TypeError('Eval command cannot execute without input!. You bbbaka...');
		let code = args.join(' ');
		let evaled = await eval(code);
		const type = (evaled === undefined || evaled === null) ? 'void' : evaled.constructor.name;
		if(typeof evaled !== 'string') evaled = require('util').inspect(evaled, { depth: 0 });
		evaled = evaled.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203));
		if(evaled.length > 2048) evaled = await hastebin(evaled)
		else evaled = `\`\`\`${evaled}\`\`\``;
		const embed = new RichEmbed()
		.setTitle('Evaled Context ♪')
		.setColor('GREEN')
		.setDescription(evaled)
		.addField('type', `\`\`\`${type}\`\`\``)
		.setFooter(`⏱️ ${(Date.now()-now)/1000}s`);
		return msg.channel.send(embed);
	}catch(e){
		const embed = new RichEmbed()
		.setColor('RED')
		.setTitle('🚫 Evaluate Error')
		.setDescription(`\`\`\`${e}\`\`\``)
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
	name: 'eval',
	description: 'evaluate arbitary javascript',
	usage: 'eval <code>',
	aliases: ['e'],
	ownerOnly: true,
	authorPerm: [],
	clientPerm: ['EMBED_LINKS'],
	cooldown: 0
}