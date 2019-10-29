const { RichEmbed } = require('discord.js');
const number = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣'];
const isPlayed = new Set();
const Akinator = require('../../structures/Akinator.js');

exports.run = async (client, msg, args) => {
	if(isPlayed.has(msg.channel.id)) return msg.reply('Akiantor currently play in this guild');
	isPlayed.add(msg.channel.id);
	try{
		const akinator = new Akinator('https://srv6.akinator.com:9126');
		let ans = NaN;
		const thisMess = await msg.channel.send('Fetching... Aki');
		for(const num of number){
			await thisMess.react(num);
		}
		while(akinator.progression < 95){
			const data = isNaN(ans) ? await akinator.create(msg.channel.nsfw) : await akinator.answer(ans, msg.channel.nsfw);
			if (!data || !data.answers || akinator.step >= 80) break;
			thisMess.edit(fastEmbed(`
**${++data.step}.** ${data.question} (${Math.round(Number.parseInt(data.progression, 10))}%)
${data.answers.map((x, i) => `${number[i]} ${x.answer}`).join('\n')}
			`));
			const filter = (rect, usr) => number.includes(rect.emoji.name) && usr.id === msg.author.id;
			const response = await thisMess.awaitReactions(filter, { max: 1, time: 30000 });
			if(!response.size){
				await msg.channel.send('Time is Up!');
				break;
			}
			ans = number.indexOf(response.first().emoji.name);
		}
		await thisMess.delete();
		isPlayed.delete(msg.channel.id);
		const guess = await akinator.guess();
		if (!guess){
			if(guess === 0) return msg.reply('I don\'t have any guesses. Bravo.');
			return msg.reply('Hmm... I seem to be having a bit of trouble. Check back soon!');
		}
		const embed = new RichEmbed()
		.setColor('#F78B26')
		.setTitle(`I'm ${Math.round(guess.proba * 100)}% sure it's...`)
		.setDescription(`${guess.name}${guess.description ? `\n_${guess.description}_` : ''}`)
		.setImage(guess.absolute_picture_path);
		return msg.reply(embed)
	}catch(e){
		isPlayed.delete(msg.channel.id);
		return msg.channel.send(`an error occured \`\`\`${e.stack}\`\`\``);
	}
}

function fastEmbed (description, color = '#F78B26'){
	return new RichEmbed()
	.setColor(color)
	.setDescription(description);
}

exports.info = {
	name: 'akinator',
	description: 'Think about a real or fictional character, I will try to guess who it is.',
	usage: 'akiantor',
	aliases: ['the-web-genie', 'web-genie'],
	ownerOnly: false,
	authorPerm: [],
	clientPerm: ['EMBED_LINKS'],
	cooldown: 10
}