exports.run = async (client, msg, args) => {
	const serverQueue = client.commands.get('play').queue.get(msg.guild.id);
	const voiceChannel = msg.member.voiceChannel;
	if(!voiceChannel) return msg.channel.send('❌ **| Must Join voice channel first**');
	if(!serverQueue) return msg.channel.send('❌ **| Not playing anything right now**');
	if(serverQueue.voiceChannel.id !== voiceChannel.id) return msg.channel.send(`❌ **| Must in \`${serverQueue.voiceChannel.name}\` to skip songs**`);
	try{
		const members = serverQueue.voiceChannel.members.filter(x => !x.user.bot);
		if(serverQueue.songs[0].requester.id !== msg.author.id && members.size > 2 && serverQueue.songs[0].voteSkip.length < 3){
			if(serverQueue.songs[0].voteSkip.includes(msg.author.id)) return msg.channel.send('🚫 **| You already voted to skip this song**');
			serverQueue.songs[0].voteSkip.push(msg.author.id);
			return msg.channel.send(`✅ **| You voted to skip this song need more votes** \`${serverQueue.songs[0].length}/3\``);
		}
		return serverQueue.connection.dispatcher.end();
	}catch(e){
		return msg.channel.send(`an error occured \`\`\`${e.stack}\`\`\``);
	}
}

exports.info = {
	name: 'skip',
	description: 'Skip current songs',
	usage: 'skip',
	aliases: [],
	ownerOnly: false,
	authorPerm: [],
	clientPerm: [],
	cooldown: 0
}