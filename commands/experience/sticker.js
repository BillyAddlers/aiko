const { RichEmbed } = require('discord.js');
const { readdirSync, readFileSync } = require('fs');
const { join } = require('path');
const emojis = ['⬅', '🔴', '➡'];
const { verify } = require('../../util/LevelingUtil.js');

exports.run = async (client, msg, args) => {
	if(!args.length) return args.missing(msg, 'No method provided', this.info);
	let userprof = client.userprof.got(msg.author.id);
	args[0] = args[0].toLowerCase();
	try{
		if(args[0] === 'list'){
			if(!userprof.badge.owned.length) throw '❌ **| You dont have any sticker**';
			const embed = new RichEmbed()
			.setColor('BLUE')
			.setTitle('» Your Sticker list')
			.setDescription(userprof.badge.owned.map(x => `\`${x}\``).join(', '));
			return msg.channel.send(embed);
		}
		if(args[0] === 'shop'){
			const badgeList = readdirSync(join(__dirname, '../../assets/images/badges')).map(x => x.split('.')[0]);
			const chunked = chunk(badgeList.map((x, i) => `\`${i+1}\`. **${x}** ${userprof.badge.owned.includes(x) ? '`(owned)`' : ''}`), 10);
			
			const embed = new RichEmbed()
			.setColor('BLUE')
			.setTitle('🛒 | Sticker Shop')
			.setDescription(chunked[0].join('\n'))
			.addField('\u200B', [
				'• price of each sticker is `1000` 🍫',
				`• to buy a sticker use \`${msg.guild.prefix}sticker buy <sticker name | sticker number>\``
			].join('\n'))
			.setFooter(`Page 1 of ${chunked.length}`)
			
			const thisMessage = await msg.channel.send(embed);
			if(chunked.length < 2) return;
			for(const emoji of emojis){
				await thisMessage.react(emoji);
			}
			let index = 0;
			async function chunkIfy(){
				const filter = (rect, usr) => emojis.includes(rect.emoji.name) && usr.id === msg.author.id;
				const response = await thisMessage.awaitReactions(filter, { max: 1, time: 60000});
				if(!respone.size && response.first().emoji.name === '🔴') return;
				if(response.first().emoji.name === '⬅') index--;
				if(response.first().emoji.name === '➡') index++;
				index = ((index % chunked.length) + chunked.length) % chunked.length;
				embed.setDescription(chunked[index].join('\n'));
				embed.setFooter(`Page ${index +1} of ${chunked.length}`);
				return chunkIfy();
			}
			return chunkIfy();
		}
		if(args[0] === 'buy'){
			const badgeList = readdirSync(join(__dirname, '../../assets/images/badges')).map(x => x.split('.')[0]);
			if(userprof.coins < 1000) throw '❌ **| You don\'t have `1000` 🍫**';
			if(!args[1]) throw `❌ **| Please provide number of sticker or name of sticker. Use \`${msg.guild.prefix}sticker shop\` to see list sticker you can bought**`;
			let badge = args[1].toLowerCase();
			if(!isNaN(args[1])) badge = badgeList[parseInt(args[1], 10)-1];
			if(!badgeList.includes(badge)) throw `❌ **| No sticker with ${isNaN(args[1]) ? 'name' : 'number'} \`${args[1]}\`**`;
			if(userprof.badge.owned.includes(badge)) throw `**| You already owned that sticker**`;
			const thisMess = await msg.channel.send(`❓ **| Are you sure wanna buy sticker \`${badge}\` with \`1000\` 🍫 ?**`);
			const verified = await verify(thisMess, msg.author);
			await thisMess.delete();
			if(!verified) return;
			userprof.coins -= 1000;
			userprof.badge.owned.push(badge);
			client.userprof.set(msg.author.id, userprof);
			return msg.channel.send(`✅ **| Succes buying sticker \`${badge}\`**`);
		}
		if(args[0] === 'place'){
			if(!userprof.badge.owned.length) throw '❌ **| You dont have any sticker**';
			if(!args[1]) throw `❌ **| Please provide name of sticker, right syntax: \`${msg.guild.prefix}sticker place <name | void> <position>\`. Use \`${msg.guild.prefix}sticker list\` to see list sticker you have**`;
			args[1] = args[1].toLowerCase();
			if(args[1] !== 'void' && !userprof.badge.owned.includes(args[1])) throw `❌ **| you dont have sticker named \`${args[1]}\`**`;
			if(!args[2]) throw `❌ **| Please provide position of sticker to place, right syntax: \`${msg.guild.prefix}sticker place <name> <position>\`**`;
			if(isNaN(args[2])) throw `❌ **| Please provide valid number**`;
			args[2] = parseInt(args[2], 10);
			if(args[2] < 0 && args[2] > 3) throw `❌ **| Only in range \`1-3\`**`;
			userprof.badge.show[args[2]-1] = args[1] === 'void' ? undefined : args[1];
			client.userprof.set(msg.author.id, userprof);
			return msg.channel.send(`✅ **| Now \`${args[1]}\` place in position \`${args[2]}\`**`);
		}
		if(args[0] === 'view'){
			const badgeList = readdirSync(join(__dirname, '../../assets/images/badges'));
			if(!args[1]) throw '❌ **| Please provide badge name**';
			if(!badgeList.includes(args[1].toLowerCase() + '.png')) throw `❌ **| No badge named \`${args[1]}\`**`;
			const attachment = readFileSync(join(__dirname, '../../assets/images/badges', args[1].toLowerCase() + '.png'));
			const embed = new RichEmbed()
			.setColor('blue')
			.setTitle(`📂 ${args[1]}`)
			.attachFile({attachment, name: 'out.png'})
			.setImage('attachment://out.png');
			return msg.channel.send(embed);
		}
	}catch(e){
		if(typeof e === 'string') return msg.channel.send(e);
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

exports.info = {
	name: 'sticker',
	description: 'containing about your profile sticker',
	usage: 'sticker <list | shop | place | buy | view>',
	aliases: ['badge', 'stkr'],
	ownerOnly: false,
	authorPerm: [],
	clientPerm: ['EMBED_LINKS'],
	cooldown: 3
}