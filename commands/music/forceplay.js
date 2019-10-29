exports.run = async (client, msg, args) => {
	try{
		return client.commands.get('play').run(client, msg, args, true);
	}catch(e){
		return msg.channel.send(`an error occured \`\`\`${e.stack}\`\`\``);
	}
}

exports.info = {
	name: 'forceplay',
	description: 'play some songs but force',
	usage: 'forceplay <query | link | playlist>',
	aliases: ['fp', 'fplay'],
	ownerOnly: false,
	authorPerm: [],
	clientPerm: [],
	cooldown: 10
}