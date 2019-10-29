const { RichEmbed } = require('discord.js');
const { Canvas } = require('canvas-constructor');
const { readdirSync, readFileSync } = require('fs');
const { join } = require('path');
const { get } = require('node-superfetch');
const { nFormatter } = require('../../util/LevelingUtil.js');
const Blackjack = require('../../structures/Blackjack.js');

const fonts = readdirSync(join(__dirname, '../../assets/fonts'));
for(const font of fonts){
	Canvas.registerFont(join(__dirname, '../../assets/fonts', font), font.split('.')[0]);
}

exports.run = async (client, msg, args) => {
	if(!args.length) return args.missing(msg, 'No bet provided', this.info);
	const userprof = client.userprof.got(msg.author.id);
	const balance = userprof.coins;
	const bet = parseInt(args[0], 10);
	if(!balance) return msg.channel.send('❌ **| You don\'t have any 🍫 now.**');
	if(isNaN(bet)) return msg.channel.send('❌ **| Use valid number**');
	if(!bet) return msg.channel.send('❌ **| You cannot bet \`0\` 🍫**');
	if(bet > balance) return msg.channel.send(`❌ **| You have dont have \`${bet}\` 🍫**`);
	try{
		if (Blackjack.gameExists(msg.author.id)) {
			return msg.reply(`❌ **| you can't start 2 games of blackjack at the same time.**`);
		}
		const blackjack = new Blackjack(msg);
		const playerHand = blackjack.getHand();
		let dealerHand = blackjack.getHand();
		let playerHands;
		const { raw: dealerAvatar } = await get(client.user.displayAvatarURL);
		const { raw: userAvatar } = await get(msg.author.displayAvatarURL);
		if (Blackjack.handValue(playerHand) !== 'Blackjack') {
			playerHands = await getFinalHand(msg, playerHand, dealerHand, balance, bet, blackjack, dealerAvatar, userAvatar);
			const result = gameResult(Blackjack.handValue(playerHands[0]), 0);
			const noHit = playerHands.length === 1 && result === 'bust';
			while ((Blackjack.isSoft(dealerHand) || Blackjack.handValue(dealerHand) < 17) && !noHit) {
				blackjack.hit(dealerHand);
			}
		}else {
			playerHands = [playerHand];
		}
		blackjack.endGame();
		const dealerValue = Blackjack.handValue(dealerHand);
		let winnings = 0;
		let hideHoleCard = true;
		const embed = new RichEmbed()
		.setTitle(`Blackjack | ${msg.member.displayName}`)
		.setFooter(blackjack.cardsRemaining() ? `Cards remaining: ${blackjack.cardsRemaining()}` : 'Shuffling');
		playerHands.forEach((hand, i) => {
			const playerValue = Blackjack.handValue(hand);
			const result = gameResult(playerValue, dealerValue);
			if (result !== 'bust') hideHoleCard = false;
			const lossOrGain = Math.floor((['loss', 'bust'].includes(result) ? -1 : result === 'push' ? 0 : 1) * (hand.doubled ? 2 : 1) * (playerValue === 'Blackjack' ? 1.5 : 1) * bet);
			winnings += lossOrGain;
			const soft = Blackjack.isSoft(hand);
			embed.addField(playerHands.length === 1 ? '**Your hand**' : `**Hand ${i + 1}**`, `
${hand.join(' - ')}
Value: ${soft ? 'Soft ' : ''}${playerValue}
Result: ${result.replace(/(^\w|\s\w)/g, ma => ma.toUpperCase())}${result !== 'push' ? `, ${lossOrGain}` : ', 🍫 back'}
			`, true);
		});
		embed
		.addField('**Dealer hand**', `
${hideHoleCard ? `${dealerHand[0]} - XX` : dealerHand.join(' - ')}
Value: ${hideHoleCard ? Blackjack.handValue([dealerHand[0]]) : dealerValue}
		`)
		.setColor(winnings > 0 ? 'GREEN' : winnings < 0 ? 'RED' : 'GOLD')
		.setDescription(`You ${winnings === 0 ? 'broke even' : `${winnings > 0 ? 'won' : 'lost'} \`${Math.abs(winnings)}\` 🍫`}`);
		if (winnings !== 0){
			userprof.coins = userprof.coins + winnings;
			client.userprof.set(msg.author.id, userprof);
		}
		const attachment = getImage(bet, msg.member.displayName, msg.guild.me.displayName, playerHands[0], hideHoleCard ? [dealerHand[0], 'XX'] : dealerHand, `${Blackjack.isSoft(playerHands[0]) ? 'Soft ' : ''}${Blackjack.handValue(playerHands[0])}`, `${hideHoleCard ? Blackjack.handValue([dealerHand[0]]) : dealerValue}`, dealerAvatar, userAvatar);
		embed.attachFile({attachment, name: 'blackjack.png'})
		.setImage('attachment://blackjack.png');
		return msg.channel.send(embed);
	}catch(e){
		return msg.channel.send(e.stack, { code: 'ini' });
	}
}

function gameResult(playerValue, dealerValue) {
	if (playerValue > 21) return 'bust';
	if (dealerValue > 21) return 'dealer bust';
	if (playerValue === dealerValue) return 'push';
	if (playerValue === 'Blackjack' || playerValue > dealerValue) return 'win';
	return 'loss';
}

function getFinalHand(msg, playerHand, dealerHand, balance, bet, blackjack, dealerAvatar, userAvatar) {
	return new Promise(async resolve => {
		const hands = [playerHand];
		let currentHand = hands[0];
		let totalBet = bet;
    let msG = undefined;
		const nextHand = () => currentHand = hands[hands.indexOf(currentHand) + 1];
		while (currentHand) {
			if (currentHand.length === 1) blackjack.hit(currentHand);
			if (Blackjack.handValue(currentHand) === 'Blackjack') {
				nextHand();
				continue;
			}
			if (Blackjack.handValue(currentHand) >= 21) {
				nextHand();
				continue;
			}
			if (currentHand.doubled) {
				blackjack.hit(currentHand);
				nextHand();
				continue;
			}
			const canDoubleDown = balance >= totalBet + bet && currentHand.length === 2;
			const canSplit = balance >= totalBet + bet && Blackjack.handValue([currentHand[0]]) === Blackjack.handValue([currentHand[1]]) && currentHand.length === 2;
			const attachment = getImage(bet, msg.member.displayName, msg.guild.me.displayName, currentHand, [dealerHand[0], 'XX'], `${Blackjack.isSoft(currentHand) ? 'Soft ' : ''}${Blackjack.handValue(currentHand)}`, `${Blackjack.isSoft([dealerHand[0]]) ? 'Soft ' : ''}${Blackjack.handValue([dealerHand[0]])}`, dealerAvatar, userAvatar);
			const embed = new RichEmbed()
			.setColor('BLACK')
			.setTitle(`Blackjack | ${msg.member.displayName}`)
			.setDescription(!canDoubleDown && !canSplit ? 'Type `hit` to draw another card or `stand` to pass.' : `Type \`hit\` to draw another card, ${canDoubleDown ? '`double down` to double down, ' : ''}${canSplit ? '`split` to split, ' : ''}or \`stand\` to pass.`)
			.addField(hands.length === 1 ? '**Your hand**' : `**Hand ${hands.indexOf(currentHand) + 1}**`, `
${currentHand.join(' - ')}
Value: ${Blackjack.isSoft(currentHand) ? 'Soft ' : ''}${Blackjack.handValue(currentHand)}
			`, true)
			.addField('**Dealer hand**', `
${dealerHand[0]} - XX
Value: ${Blackjack.isSoft([dealerHand[0]]) ? 'Soft ' : ''}${Blackjack.handValue([dealerHand[0]])}
			`, true)
			.attachFile({attachment, name: 'blackjack.png'})
			.setImage('attachment://blackjack.png')
			.setFooter(blackjack.cardsRemaining() ? `Cards remaining: ${blackjack.cardsRemaining()}` : `Shuffling`);
			if(!msG){
        msG = await msg.channel.send(embed);
      }else{
        await msG.delete();
        msG = await msg.channel.send(embed);
      }
			const responses = await msg.channel.awaitMessages(msg2 =>
				msg2.author.id === msg.author.id && (
					msg2.content.toLowerCase() === 'hit' || msg2.content.toLowerCase() === 'stand' || (msg2.content.toLowerCase() === 'split' && canSplit) || (msg2.content.toLowerCase() === 'double down' && canDoubleDown)
			), { max: 1, time: 20e3 });
			if (responses.size === 0) break;
			const action = responses.first().content.toLowerCase();
			if (action === 'stand' || Blackjack.handValue(currentHand) >= 21) {
				if (currentHand === hands[hands.length - 1]) break;
				nextHand();
			}
			if (action === 'hit') blackjack.hit(currentHand);
			if (action === 'split' && canSplit) {
				totalBet += bet;
				hands.push([currentHand.pop()]);
				blackjack.hit(currentHand);
			}
			if (action === 'double down' && canDoubleDown) {
				totalBet += bet;
				currentHand.doubled = true;
			}
		}
    await msG.delete();
		return resolve(hands);
	});
}

function getImage (bet, user, dealer, currentHand, dealerHand, userValue, dealerValue, dealerAvatar, userAvatar){
	const board = readFileSync(join(__dirname, '../../assets/images/casino/board.png'));
	
	let canvas = new Canvas(400, 300)
	.setShadowColor('rgba(22,22,22,1)')
	.setShadowBlur(10)
	.addRect(35+5, 44+5, 330-7, 209-7)
	.addBeveledImage(board, 35, 44, 330, 209, 10, true)
	.setColor('white')
	.addRect(6, 92, 64, 64)
	.addRect(330, 122, 64, 64)
	.addImage(dealerAvatar, 6+2, 92+2, 64-4, 64-4)
	.addImage(userAvatar, 330+2, 122+2, 64-4, 64-4)
	.setColor('black')
	.setGlobalAlpha(0.25)
	.addRect(70, 100, 105, 41)
	.addRect(70, 100, 105, 20)
	.addRect(213, 131, 117, 41)
	.addRect(213, 131, 117, 20)
	.addBeveledRect(73, 148, 78, 48, 10, true)
	.setTextFont('19px Anal')
	.setGlobalAlpha(1)
	.setTextAlign('left')
	.setColor('#E6D083')
	.addText('BET', 95, 168)
	.setTextAlign('center')
	.setColor('#4A8B45')
	.addText(nFormatter(bet), 110, 190)
	.setColor('white')
	.setTextAlign('left')
	.setTextFont('17px Roboto-Regular, NotoEmoji-Regular')
	.addResponsiveText(dealer, 77, 117, 94)
	.setTextFont('17px Anal')
	.addText(String(dealerValue).toUpperCase(), 77, 137)
	.setTextAlign('right')
	.setTextFont('17px Roboto-Regular, NotoEmoji-Regular')
	.addResponsiveText(user, 324, 147, 109)
	.setTextFont('17px Anal')
	.addText(String(userValue).toUpperCase(), 323, 167)
	.addImage(getChip(), 164, 194)
	.addImage(getChip(), 230, 183)
	.addImage(getChip(), 191, 185);
	
	for(let i = 0; i < currentHand.length; i++){
		const card = getCards(currentHand[i]);
		canvas = canvas.addImage(card, i*55+3, 203);
	}
	
	for(let i = 0; i < dealerHand.length; i++){
		const card = getCards(dealerHand[i], true);
		canvas = canvas.addImage(card, 273-55*i-3, -68);
	}
	
	return canvas.toBuffer();
}

function getCards (name, flip = false){
	const suits = { '♣': 'C', '♦': 'D', '❤': 'H', '♠' : 'S' };
	const rank = name.length > 2 ? name[0]+name[1] : name[0];
	const suit = suits[name.length > 2 ? name[2] : name[1]];
	let path = `../../assets/images/casino/cards/${suit}/${rank}.png`;
	if(name === 'XX') path = '../../assets/images/casino/cards/backcard.png';
	const buffCard = readFileSync(join(__dirname, path));
	
	return new Canvas(128, 165)
	.translate(128/2,165/2)
	.rotate(flip && name !== 'XX' ? (180*Math.PI/180)-0.25 : -0.25)
	.addImage(buffCard, -96/2,-147/2)
	.toBuffer();
}

function getChip(){
	const buffChip = readFileSync(join(__dirname, '../../assets/images/casino/chip.png'));
	const degree = Math.floor(Math.random()*360);
	
	return new Canvas(55, 55)
	.translate(55/2, 55/2)
	.rotate(degree*Math.PI/180)
	.addImage(buffChip, -55/2, -55/2)
	.toBuffer();
}

exports.info = {
	name: 'blackjack',
	description: 'Bet your 🍫 with blackjack game',
	usage: 'blackjack <bet>',
	aliases: ['bj'],
	ownerOnly: false,
	authorPerm: [],
	clientPerm: ['EMBED_LINKS'],
	cooldown: 0
}