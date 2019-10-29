exports.run = async (client, msg, args) => {
	const serverQueue = client.commands.get('play').queue.get(msg.guild.id);
	const voiceChannel = msg.member.voiceChannel;
	if(!voiceChannel) return msg.channel.send('❌ **| Must Join voice channel first**');
	if(!serverQueue) return msg.channel.send('❌ **| Not playing anything right now**');
	if(serverQueue.voiceChannel.id !== voiceChannel.id) return msg.channel.send(`❌ **| Must in \`${serverQueue.voiceChannel.name}\` to loop/ unloop current queue**`);
	try{
		serverQueue.loop = !serverQueue.loop;
		return msg.channel.send(`✅ **| ${serverQueue.loop ? 'Loop current queue' : 'Unloop current queue'}**`);
	}catch(e){
		return msg.channel.send(`an error occured \`\`\`${e.stack}\`\`\``);
	}
}

exports.info = {
	name: 'loop',
	description: 'loop current queue',
	usage: 'loop',
	aliases: [],
	ownerOnly: false,
	authorPerm: [],
	clientPerm: [],
	cooldown: 0
}