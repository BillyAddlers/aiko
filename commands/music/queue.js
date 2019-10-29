const { RichEmbed } = require('discord.js');
const reactions = ['⏪', '⬅', '🔴', '➡', '⏩'];

exports.run = async (client, msg, args) => {
	const { showSeconds, queue } = msg.client.commands.get('play');
	const serverQueue = queue.get(msg.guild.id);
	if(!serverQueue) return msg.channel.send('❌ **| Not playing anything right now**');
	try{
		if(serverQueue.songs.length === 1) return msg.channel.send(`🎶 | **${serverQueue.songs[0].title}**\n${client.commands.get('np').getProgbar(msg)}`, {embed: new RichEmbed().setColor('RANDOM').setDescription('No songs in queue')});
		const chunked = chunk(serverQueue.songs.slice(1).map((x,i) => `${i+1}. \`${showSeconds(x.durationSeconds*1000)}\` **${x.title}** by ${x.requester.toString()}`), 10);
		if(chunked.length === 1) return msg.channel.send(`🎶 | **${serverQueue.songs[0].title}**\n${client.commands.get('np').getProgbar(msg)}\n\n${serverQueue.songs.length-1} entrie(s) | \`${showSeconds(serverQueue.songs.slice(1).map(x => x.durationSeconds).reduce((a,b) => a + b)*1000)}\`${serverQueue.loop ? ' | 🔁' : ''}`, getEmbed(chunked[0]));
		
		const thisMess = await msg.channel.send(`🎶 | **${serverQueue.songs[0].title}**\n${client.commands.get('np').getProgbar(msg)}\n\n${serverQueue.songs.length-1} entrie(s) | \`${showSeconds(serverQueue.songs.slice(1).map(x => x.durationSeconds).reduce((a,b) => a + b)*1000)}\`${serverQueue.loop ? ' | 🔁' : ''}`, getEmbed(chunked[0], 1, chunked.length));
		let index = 0;
		for(const emo of reactions){
			await thisMess.react(emo);
		}
		async function awaitReactions (){
			const filter = (rect, usr) => reactions.includes(rect.emoji.name) && usr.id === msg.author.id;
			const responses = await thisMess.awaitReactions(filter, { max: 1, time: 30000});
			if(!responses.size) return;
			const emoji = responses.first().emoji.name;
			if(emoji === '🔴') return;
			if(emoji === '⏪') index -= 10;
			if(emoji === '⬅') index--;
			if(emoji === '➡') index++;
			if(emoji === '⏩') index += 10;
			index = ((index % chunked.length) + chunked.length) % chunked.length;
			await thisMess.edit(`🎶 | **${serverQueue.songs[0].title}**\n${client.commands.get('np').getProgbar(msg)}\n\n${serverQueue.songs.length-1} entrie(s) | \`${showSeconds(serverQueue.songs.slice(1).map(x => x.durationSeconds).reduce((a,b) => a + b)*1000)}\`${serverQueue.loop ? ' | 🔁' : ''}`, getEmbed(chunked[index], index+1, chunked.length));
			return awaitReactions();
		}
		return awaitReactions();
	}catch(e){
		return msg.channel.send(`an error occured \`\`\`${e.stack}\`\`\``);
	}
}

function chunk (arr, chunkSize) {
	const temp = [];
	for(let i = 0; i < arr.length; i+= chunkSize){
		temp.push(arr.slice(i, i+chunkSize));
	}
	return temp;
}

function getEmbed (chunk, page, lastPage){
	let embed = new RichEmbed()
	.setColor('RANDOM')
	.setDescription(chunk.join('\n'));
	if(page) embed.setFooter(`Page ${page} \ ${lastPage}`);
	return embed;
}

exports.info = {
	name: 'queue',
	description: 'show current queue',
	usage: 'queue',
	aliases: ['q'],
	ownerOnly: false,
	authorPerm: [],
	clientPerm: [],
	cooldown: 0
}