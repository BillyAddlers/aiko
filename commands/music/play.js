const { Collection, RichEmbed } = require('discord.js');
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const numbers = ['1⃣', '2⃣', '3⃣', '4⃣'];

const queue = new Collection();

exports.run = async (client, msg, args, force = false) => {
	const youtube = new YouTube(client.config.env.GOOGLE_KEY);
	try{
		const serverQueue = queue.get(msg.guild.id);
		const voiceChannel = msg.member.voiceChannel;
		if(!voiceChannel) return msg.channel.send('❌ **| Must Join voice channel first**');
		if(serverQueue && serverQueue.voiceChannel.id !== voiceChannel.id) return msg.channel.send(`❌ **| Must in \`${serverQueue.voiceChannel.name}\` to add some songs**`);
		if(!voiceChannel.permissionsFor(client.user).has(['SPEAK', 'CONNECT'])) return msg.channel.send(`❌ **| I don't have permissions \`SPEAK\` or \`CONNECT\`**`);
		if(!args.length) return args.missing(msg, 'No query, playlist or link provided', this.info);
		if(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/.test(args[0])){
			const playlist = await youtube.getPlaylist(args[0]);
			const videos = await playlist.getVideos();
			for (const video of Object.values(videos)) {
				try{
					const vid = await youtube.getVideoByID(video.id);
					await handleVideo(vid, msg, voiceChannel, true);
				} catch(err) { continue }
			}
			return msg.channel.send(`✅ **| ${playlist.title}** has been added to queue!`);
		}
		try{
			const video = await youtube.getVideo(args[0]);
			return handleVideo(video, msg, voiceChannel);
		}catch(err){
			const videos = await youtube.searchVideos(args.join(' '), 4);
			if(!videos.length) return msg.channel.send(`🚫 **| No result with query \`${args.join(' ')}\`**`);
			if(force){
				const vid = await youtube.getVideoByID(videos[0].id);
				return handleVideo(vid, msg, voiceChannel);
			}
			const embed = new RichEmbed()
			.setColor('#FF1800')
			.setDescription(videos.map((x, i) => `${numbers[i]} **${x.title}**`).join('\n'));
			const searchM = await msg.channel.send(embed);
			const emo = ['❌'];
			for(let i = 0; i < videos.length; i++){
				await searchM.react(numbers[i]);
				emo.push(numbers[i]);
			}
			await searchM.react('❌');
			const filter = (rect, usr) => emo.includes(rect.emoji.name) && usr.id === msg.author.id;
			const resp = await searchM.awaitReactions(filter, {max: 1, time: 30000});
			searchM.delete();
			if(!resp.size || resp.first().emoji.name === '❌') return;
			const num = numbers.indexOf(resp.first().emoji.name);
			const vid = await youtube.getVideoByID(videos[num].id);
			return handleVideo(vid, msg, voiceChannel);
		}
	}catch(e){
		return msg.channel.send(`an error occured \`\`\`${e.stack}\`\`\``);
	}
}

async function handleVideo(video, msg, voiceChannel, hide = false){
	video.voteSkip = [];
	video.requester = msg.author;
	const serverQueue = queue.get(msg.guild.id);
	if(!serverQueue){
		let Queue = {
			channel: msg.channel,
			voiceChannel,
			songs: [video],
			loop: false,
			isPlay: true,
			volume: 50
		}
		const pleaseWait = await msg.channel.send(`⏳ **| Joining \`${voiceChannel.name}\`**`);
		try{
			Queue.connection = await voiceChannel.join();
			await pleaseWait.edit(`✅ **| Succes joining** \`${voiceChannel.name}\``);
		}catch(e){
			return pleaseWait.edit(`🚫 **| Cannot join voice channel because** \`\`\`ini\n${e}\`\`\``);
		}
		queue.set(msg.guild.id, Queue);
		play(msg.guild, Queue.songs[0]);
		return pleaseWait.delete();
	}
	serverQueue.songs.push(video);
	if(!hide) return serverQueue.channel.send(`✅ | Added to queue **${video.title}** \`${exports.showSeconds(video.durationSeconds*1000)}\``);
}

function play(guild, song, seek=0){
	const serverQueue = queue.get(guild.id);
	if(!song){
		serverQueue.voiceChannel.leave();
		serverQueue.channel.send('✅ **| Queue conclued!**');
		return queue.delete(guild.id);
	}
	const readStream = ytdl(song.url, { filter: 'audioonly' });
	serverQueue.connection.playStream(readStream, {seek})
	.on('end', reason => {
		const shiffed = serverQueue.songs.shift();
		if(serverQueue.loop) serverQueue.songs.push(shiffed);
		play(guild, serverQueue.songs[0]);
	})
	.on('error', console.error);
	serverQueue.channel.send(`🎶 | Now playing: **${song.title}** \`${exports.showSeconds(song.durationSeconds*1000)}\``);
	return serverQueue.connection.dispatcher.setVolumeLogarithmic(serverQueue.volume/50);
}

exports.queue = queue;

exports.showSeconds = (duration) => {
	const SECOND = 1000;
	const MINUTE = SECOND * 60;
	const HOUR = MINUTE * 60;
	const seconds = Math.floor(duration / SECOND) % 60;
	if (duration < MINUTE) return `00:${seconds.toString().padStart(2, '0')}`;
	const minutes = Math.floor(duration / MINUTE) % 60;
	let output = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	if (duration >= HOUR) {
		const hours = Math.floor(duration / HOUR);
		output = `${hours.toString().padStart(2, '0')}:${output}`;
	}
	return output;
}

exports.info = {
	name: 'play',
	description: 'play some youtube videos /songs',
	usage: 'play <query | link | playlist>',
	aliases: ['p'],
	ownerOnly: false,
	authorPerm: [],
	clientPerm: ['EMBED_LINKS'],
	cooldown: 10
}