exports.run = async (client, msg, args) => {
	const serverQueue = client.commands.get('play').queue.get(msg.guild.id);
	const voiceChannel = msg.member.voiceChannel;
	if(!voiceChannel) return msg.channel.send('❌ **| Must Join voice channel first**');
	if(!serverQueue) return msg.channel.send('❌ **| Not playing anything right now**');
	if(serverQueue.voiceChannel.id !== voiceChannel.id) return msg.channel.send(`❌ **| Must in \`${serverQueue.voiceChannel.name}\` to stop current queue**`);
	try{
		serverQueue.songs = [];
		return serverQueue.connection.dispatcher.end();
	}catch(e){
		return msg.channel.send(`an error occured \`\`\`${e.stack}\`\`\``);
	}
}

exports.info = {
	name: 'stop',
	description: 'stop current queue',
	usage: 'stop',
	aliases: [],
	ownerOnly: false,
	authorPerm: [],
	clientPerm: [],
	cooldown: 0
}