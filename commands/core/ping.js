exports.run = async (client, msg, args) => {
	const now = Date.now();
	try{
		const m = await msg.channel.send('🏓');
		return m.edit(`🏓 Pong..., RoundTrip **${Date.now()-now}ms**, Latency **${m.createdTimestamp-msg.createdTimestamp}ms**, API **${client.ping.toFixed(2)}**`);
	}catch(e){
		return msg.channel.send(`an error occured \`\`\`${e.stack}\`\`\``);
	}
}

exports.info = {
	name: 'ping',
	description: 'Ping pong with the bot',
	usage: 'ping',
	aliases: [],
	ownerOnly: false,
	authorPerm: [],
	clientPerm: [],
	cooldown: 0
}