const { Canvas } = require('canvas-constructor');
const { RichEmbed } = require('discord.js');
const { readFileSync, readdirSync } = require('fs');
const { join } = require('path');
const elements = ['apple', 'banana', 'bell', 'goldbar', 'lemon', 'pineapple'];

const fonts = readdirSync(join(__dirname, '../../assets/fonts'));
for(const font of fonts){
	Canvas.registerFont(join(__dirname, '../../assets/fonts', font), font.split('.')[0]);
}

exports.run = async (client, msg, args) => {
	if(!args.length) return args.missing(msg, 'No bet provided', this.info);
	try{
		const userprof = client.userprof.got(msg.author.id);
		const balance = userprof.coins;
		const bet = parseInt(args[0], 10);
		if(!balance) return msg.channel.send('❌ **| You don\'t have any 🍫 now.**');
		if(isNaN(bet)) return msg.channel.send('❌ **| Use valid number**');
		if(bet < 1 || bet > 9999) return msg.channel.send('❌ **| You only can bet in range \`0 - 9999\` 🍫**');
		if(bet > balance) return msg.channel.send(`❌ **| You have dont have \`${bet}\` 🍫**`);
		
		const one = getRandomElement();
		const two = getRandomElement();
		const three = getRandomElement();
		const winnings = getValue(one, two, three, bet);
		
		let message = `**\`${msg.member.displayName}\`, bet \`${bet}\` 🍫 and `;
		message += !winnings ? 'lost everything**' : `win \`${winnings}\` 🍫**`;
		
		userprof.coins += (-bet + winnings);
		client.userprof.set(msg.author.id, userprof);
		
		const embed = new RichEmbed()
		.setColor(!winnings ? 'RED' : 'GREEN')
		.setTitle('🎰 SLOTS MACHINE 🎰')
		.setDescription(message)
		.attachFile({attachment: getImage(one, two, three, bet, winnings), name: 'slots.png'})
		.setImage('attachment://slots.png');
		
		return msg.channel.send(embed);
	}catch(e){
		return msg.channel.send(`an error occured \`\`\`${e.stack}\`\`\``);
	}
}

function getValue (one, two, three, bet){
	const elements = [one, two, three];
	let total = 0;
	let element = undefined;
	for(const el of elements){
		const values = elements.filter(x => x === el);
		if(values.length > 1){
			total = values.length;
			element = values[0];
			break;
		}
	}
	
	const values = {
		apple: 100,
		banana: 200,
		bell: 400,
		goldbar: 500,
		lemon: 600,
		pineapple: 700
	}
	if(!total) return 0;
	return (total > 2 ? values[element] : values[element]/2) + bet;
}

function getElement(element){
	const elBuff = readFileSync(join(__dirname, '../../assets/images/casino/elements', element + '.png'));
	return new Canvas(80,80)
	.addImage(elBuff, 0, 0, 80, 80)
	.toBuffer();
}

function getRandomElement(){
	return elements[Math.floor(Math.random()*elements.length)%elements.length];
}

function getImage(one, two, three, bet, winnings){
	const reel = readFileSync(join(__dirname, '../../assets/images/casino/reel.png'));
	
	return new Canvas(460, 254)
	.setShadowColor('rgba(22,22,22,1)')
	.setShadowBlur(10)
	.addRect(15+2, 15+2, 430-4, 224-4)
	.addBeveledImage(reel, 15, 15, 430, 224, 10)
	.setColor('red')
	.setTextFont('30px Digital')
	.setTextAlign('right')
	.addText(String(winnings), 196, 226)
	.addText(String(bet), 355, 226)
	.addImage(getElement(one), 54, 69)
	.addImage(getElement(two), 190, 69)
	.addImage(getElement(three), 326, 69)
	.toBuffer();
}

exports.info = {
	name: 'slots',
	description: 'Bet your 🍫 with slots machine',
	usage: 'slots',
	aliases: ['sl', 'slot'],
	ownerOnly: false,
	authorPerm: [],
	clientPerm: ['ATTACH_FILES', 'EMBED_LINKS'],
	cooldown: 10
}