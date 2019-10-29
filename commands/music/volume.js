exports.run = async (client, msg, args) => {
	const serverQueue = client.commands.get('play').queue.get(msg.guild.id);
	const voiceChannel = msg.member.voiceChannel;
	if(!voiceChannel) return msg.channel.send('❌ **| Must Join voice channel first**');
	if(!serverQueue) return msg.channel.send('❌ **| Not playing anything right now**');
	if(serverQueue.voiceChannel.id !== voiceChannel.id) return msg.channel.send(`❌ **| Must in \`${serverQueue.voiceChannel.name}\` to change volume**`);
	if(!args.length) return msg.channel.send(`${serverQueue.volume < 50 ? '🔈' : serverQueue.volume > 99 ? '🔊' : '🔉'} | Current queue volume is** \`${serverQueue.volume}%\``);
	try{
		const volume = parseInt(args[0], 10);
		if(isNaN(volume)) return msg.channel.send('❌ **| The input must be a valid number**');
		if(volume > 100 || volume < 1) return msg.channel.send('❌ **| Volume can changed if input in range 1 - 100**');
		serverQueue.connection.dispatcher.setVolumeLogarithmic(volume/50);
		serverQueue.volume = volume;
		return msg.channel.send(`✅ **| Succes change volume to** \`${args[0]}%\``);
	}catch(e){
		return msg.channel.send(`an error occured \`\`\`${e.stack}\`\`\``);
	}
}

exports.info = {
	name: 'volume',
	description: 'change or show current queue volume',
	usage: 'volume [number]',
	aliases: ['vol'],
	ownerOnly: false,
	authorPerm: [],
	clientPerm: [],
	cooldown: 0
}