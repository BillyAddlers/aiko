const { Canvas } = require('canvas-constructor');
const { join } = require('path');
const pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ23456789'.split('');

exports.run = async (client, msg, args) => {
	try{
		Canvas.registerFont(join(__dirname, '..', '..', 'assets', 'fonts', 'Captcha.ttf'), 'Captcha');
		const color = `#${(Math.floor(Math.random()*0xFFFFFF)).toString(16)}`
		const txt = randomText(5);
		const attachment = new Canvas(125, 32)
		.setColor('white')
		.addRect(0,0,125,32)
		.beginPath()
		.setColor(color)
		.setTextFont('26px Captcha')
		.rotate(-0.05)
		.addText(txt, 15, 26)
		.toBuffer();
		await msg.reply('**You have 15 seconds, what does the captcha say?**', {file:{attachment, name: 'captcha-quiz.png'}});
		const msgs = await msg.channel.awaitMessages(res => res.author.id === msg.author.id, { max: 1, time: 15000 });
		if (!msgs.size) return msg.reply(`Sorry, time is up! It was **${txt}**.`);
		if (msgs.first().content !== txt) return msg.reply(`Nope, sorry, it's **${txt}**.`);
		return msg.reply(`Right it was **${txt}**`);
	}catch(e){
		return msg.channel.send(`an error occured \`\`\`${e.stack}\`\`\``);
	}
}

function randomText(len) {
	const result = [];
	for (let i = 0; i < len; i++) result.push(pool[Math.floor(Math.random() * pool.length)]);
	return result.join('');
}

exports.info = {
	name: 'captcha',
	description: 'Try to guess what the captcha says.',
	usage: 'captcha',
	aliases: [],
	ownerOnly: false,
	authorPerm: [],
	clientPerm: ['ATTACH_FILES'],
	cooldown: 2
}