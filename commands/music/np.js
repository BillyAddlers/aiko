const { RichEmbed } = require('discord.js');

exports.run = async (client, msg, args) => {
	const serverQueue = client.commands.get('play').queue.get(msg.guild.id);
	try{
		if(!serverQueue) return msg.channel.send('❌ **| Not playing anything right now**');
		const content = `**${serverQueue.isPlay ? 'Now Playing' : 'Paused'} in \`${serverQueue.voiceChannel.name}\`**`;
		const embed = new RichEmbed()
		.setColor('#FF1B00')
		.setAuthor(serverQueue.songs[0].requester.tag, serverQueue.songs[0].requester.displayAvatarURL)
		.setTitle(serverQueue.songs[0].title)
		.setURL(serverQueue.songs[0].url)
		.setThumbnail(serverQueue.songs[0].thumbnails.high.url)
		.setDescription(this.getProgbar(msg));
		return msg.channel.send(content, { embed });
	}catch(e){
		return msg.channel.send(`an error occured \`\`\`${e.stack}\`\`\``);
	}
}

exports.getProgbar = msg => {
	const { showSeconds, queue } = msg.client.commands.get('play');
	const serverQueue = queue.get(msg.guild.id);
	const est = Math.floor((serverQueue.connection.dispatcher.time / (serverQueue.songs[0].durationSeconds*1000))*12);
	const dur = `\n\`[ ${showSeconds(serverQueue.connection.dispatcher.time)} / ${showSeconds(serverQueue.songs[0].durationSeconds*1000)} ]\``;
	let progBar = serverQueue.isPlay ? '▶' : '⏸';
	for(let i = 0; i < 12; i++){
		progBar += i === est ? '🔘' : '▬';
	}
	return progBar + dur;
}

exports.info = {
	name: 'np',
	description: 'Show current song playing',
	usage: 'np',
	aliases: [],
	ownerOnly: false,
	authorPerm: [],
	clientPerm: [],
	cooldown: 0
}