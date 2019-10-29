const { RichEmbed, Attachment } = require('discord.js');
const { readdirSync, readFile, readFileSync } = require('fs');
const { Canvas } = require('canvas-constructor');
const { join } = require('path');
const { get } = require('node-superfetch');
const { getLevelBounds, nFormatter } = require('../../util/LevelingUtil.js');
const getFile = require('util').promisify(readFile);

const fonts = readdirSync(join(__dirname, '../../assets/fonts'));
for(const font of fonts){
	Canvas.registerFont(join(__dirname, '../../assets/fonts', font), font.split('.')[0]);
}

exports.run = async (client, msg, args) => {
	const user = msg.mentions.users.first() || client.users.get(args[0]) || msg.author;
	if(user.bot) return msg.channel.send('🤖 **| Bot doesn\'t have profile**');
	let userprof = client.userprof.got(user.id);
	try{
		const painMessage = await msg.channel.send('🖌️ **| Painting...**');
		const plate = await getFile(join(__dirname, '../../assets/images/profile.png'));
		const badge = getBadgeImage(userprof.badge);
		const { raw: avatar } = await get(user.displayAvatarURL.replace(/\.gif.+/, '.png'));
		const { raw: background } = await get(userprof.bg);
		const { upperBound, lowerBound } = getLevelBounds(userprof.level);
		const fillValue = Math.min(Math.max((userprof.xp - lowerBound)/ (upperBound - lowerBound), 0), 1);
		const lines = getWrapText(userprof.note.replace(/\\n/g, ' '), 42);
		
		let canvas = new Canvas(800, 600)
		.addImage(background, 87, 30, 691, 242)
		.addImage(plate, 0, 0)
		.addImage(getColorStape(plate, userprof.colorstape, nFormatter(userprof.rep)), 12, 10)
		.addImage(badge, 360, 355)
		.setColor('#2F2F2F')
		.setTextFont('30px Roboto-Regular, NotoEmoji-Regular')
		.setTextAlign('left')
		.addText(user.tag, 379, 310)
		.setTextFont('bold 19px Roboto-Regular, NotoEmoji-Regular');
		
		for(let i = 0; i < lines.length; i++){
			canvas = canvas.addText(lines[i], 342, 510 + i*20);
		}
		
		canvas = canvas
		.setTextFont('28px Roboto-Regular')
		.setTextAlign('right')
		.addText(`${Math.floor(fillValue*100)}%`, 311, 544)
		.setTextAlign('left')
		.addText(nFormatter(userprof.xp), 162, 406)
		.addText(nFormatter(userprof.coins), 162, 476)
		.setTextAlign('center')
		.addText(nFormatter(userprof.level), 744, 75)
		.setColor('#FFFFFF')
		.addRect(106, 550, fillValue*206, 16)
		.beginPath()
		.lineTo(212, 148)
		.lineTo(298, 198)
		.lineTo(298, 297)
		.lineTo(212, 347)
		.lineTo(126, 297)
		.lineTo(126, 197)
		.lineTo(212, 148)
		.closePath()
		.clip()
		.addImage(avatar, 112, 147, 200, 200)
		.toBuffer();
		
		const embed = new RichEmbed()
		.setColor('#363A3F')
		.setDescription([
			`__**User Profile Card for ${user.toString()}**__`,
			`  \`✨\` **XP** : ${userprof.xp}`,
			`  \`🍫\` **Chocolate** : ${userprof.coins}`
		].join('\n'))
		.attachFile(new Attachment(canvas, 'profile.png'))
		.setImage('attachment://profile.png');
		
		await painMessage.delete()
		return await msg.channel.send(embed);
	}catch(e){
		return msg.channel.send(`an error occured \`\`\`${e.stack}\`\`\``);
	}
}

function getWrapText(text, length){
	const temp = [];
	for(let i = 0; i < text.length; i+= length){
		temp.push(text.slice(i, i+length));
	}
	return temp.map(x => x.trim());
}

function resolveColor(color){
	if(/random/gi.test(color)) color = Math.floor(Math.random()*0xFFFFFF);
	if(typeof color === 'number') color = '#' + color.toString(16);
	return color;
}

function getColorStape(frame, color, rep){
	color = resolveColor(color);
	
	const ctx = new Canvas(800, 600)
	.addImage(frame, 0, 0)
	.setTextAlign('center')
	.setTextFont('28px Roboto-Regular')
	.setColor('#FFFFFF')
	.addText(rep, 55, 85)
	.toBuffer();
	
	return new Canvas(82, 600)
	.setColor(color)
	.addRect(0, 0, 82, 570)
	.setGlobalAlpha(0.9)
	.setGlobalCompositeOperation('destination-atop')
	.addImage(ctx, -10, -10)
	.setGlobalCompositeOperation('multiply')
	.addImage(ctx, -10, -10)
	.toBuffer();
}

function getBadgeImage (badge){
	try{
		let badges = new Array(3).fill(undefined);
		for(let i = 0; i < 3; i++){
			if(!badge.show[i]) continue;
			badges[i] = readFileSync(join(__dirname, `../../assets/images/badges/${badge.show[i]}.png`));
		}
		
		let canvas = new Canvas(332, 104);
		
		for(let i = 0; i < 3; i++){
			if(!badges[i]) continue;
			canvas = canvas.addImage(badges[i], 114*i, 0,104, 104);
		}
		return canvas.toBuffer();
	}catch(e){
		return new Canvas(332, 104).toBuffer();
	}
}

exports.info = {
	name: 'profile',
	description: 'show your profile',
	usage: 'profile [user]',
	aliases: ['ppc'],
	ownerOnly: false,
	authorPerm: [],
	clientPerm: ['EMBED_LINKS', 'ATTACH_FILES'],
	cooldown: 10
}