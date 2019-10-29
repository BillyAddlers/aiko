const { verify } = require('../../util/LevelingUtil.js');
const { RichEmbed } = require('discord.js');

exports.run = async (client, msg, args) => {
	let userprof = client.userprof.got(msg.author.id);
	let image = client.userprof.config.bg;
	try{
		if(userprof.coins < 1000) throw '❌ **| You dont have \`1000\` 🍫**';
		if(args[0]) image = args[0];
		else if(msg.attachments.size) image = msg.attachments.first().url;
		
		if(!/https?:\/\/.+\.(?:png|jpg|jpeg)/gi.test(image)) throw '❌ **| Only valid image were provided: `.png`, `.jpg`, or `.jpeg`**';
		const thisMess = await msg.channel.send(`❓ **| Are you sure wanna change background ${!args[0] && !msg.attachments.size ? '`to default`' : ''} with \`1000\` 🍫 ?**`);
		const verified = await verify(thisMess, msg.author);
		await thisMess.delete();
		if(!verified) return;
		
		userprof.bg = image;
		userprof.coins -= 1000;
		
		client.userprof.set(msg.author.id, userprof);
		
		const embed = new RichEmbed()
		.setColor('GREEN')
		.setDescription('🎨 **| Succes change background with `1000` 🍫**')
		.setImage(image);
		
		return msg.channel.send(embed);
	}catch(e){
		if(typeof e === 'string') return msg.channel.send(e);
		return msg.channel.send(`an error occured \`\`\`${e.stack}\`\`\``);
	}
}

exports.info = {
	name: 'background',
	description: 'change your background with 1000 🍫',
	usage: 'background [image]',
	aliases: ['bg'],
	ownerOnly: false,
	authorPerm: [],
	clientPerm: ['EMBED_LINKS'],
	cooldown: 5
}