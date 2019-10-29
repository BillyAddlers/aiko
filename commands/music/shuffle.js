exports.run = async (client, msg, args) => {
	const serverQueue = client.commands.get('play').queue.get(msg.guild.id);
	const voiceChannel = msg.member.voiceChannel;
	if(!voiceChannel) return msg.channel.send('❌ **| Must Join voice channel first**');
	if(!serverQueue) return msg.channel.send('❌ **| Not playing anything right now**');
	if(serverQueue.voiceChannel.id !== voiceChannel.id) return msg.channel.send(`❌ **| Must in \`${serverQueue.voiceChannel.name}\` to shuffle queue**`);
	try{
		if(serverQueue.songs.length < 4) return msg.channel.send('❌ **| Add some songs first**');
		const shiffed = serverQueue.songs.shift();
		serverQueue.songs = shuffle(serverQueue.songs);
		serverQueue.songs.unshift(shiffed);
		return msg.channel.send('✅ **| Succes shuffling queue**');
	}catch(e){
		return msg.channel.send(`an error occured \`\`\`${e.stack}\`\`\``);
	}
}

function shuffle(array){
	const arr = array.slice(0);
	for(let i = arr.length -1; i >= 0; i--){
		const j = Math.floor(Math.random() * (i + 1));
		const temp = arr[i];
		arr[i] = arr[j];
		arr[j] = temp;
	}
	return arr;
}

exports.info = {
	name: 'shuffle',
	description: 'shuffle current queue',
	usage: 'shuffle',
	aliases: [],
	ownerOnly: false,
	authorPerm: [],
	clientPerm: [],
	cooldown: 0
}