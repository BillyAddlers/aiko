const moment = require('moment');
const { getCooldown } = require('../../util/LevelingUtil.js');
const blockLetter = '<:bL:489059692006604803> <:oL:489059692983746561> <:nL:489059693424017423> <:uL:489059693847904257> <:sL:489059694892285958> '.split(' ').filter(x => x && x !== ' ' || '');

exports.run = async (client, msg, args) => {
	const now = Date.now();
	const user = msg.mentions.users.first() || client.users.get(args[0]) || msg.author;
	let authorprof = client.userprof.got(msg.author.id);
	let userprof = client.userprof.got(user.id);
	try{
		const cooldown = getCooldown(authorprof.time.lastDaily, 8.64e+7, 'h [hours] m [minutes] s [seconds]');
		if(cooldown) return msg.channel.send(`⏱️ **| ${msg.author.toString()} you can collect daily again in \`${cooldown}\`**`);
		if(user.bot) return msg.channel.send(`🤖 **| ${msg.author.toString()} you can't give daily to bot**`);
		
		if(isStreak(now, authorprof.time.nextDay)) authorprof.streak++
		else authorprof.streak = 0;
		
		let amount = 200;
		let navbar = false;
		if(authorprof.streak){
			navbar = '';
			for(let i =0; i < 5; i++){
				navbar += i < authorprof.streak ? blockLetter[i] : '◽';
			}
			if(authorprof.streak > 4){
				amount += 250;
				authorprof.streak = 0;
			}
		}
		let message = user.id === msg.author.id ? `💰 **| ${user.toString()} collected \`${amount}\` 🍫 from daily credit**` : `💰 **| ${user.toString()} collected \`200\` from daily \`${msg.author.tag}\`**`;
		if(navbar) message += `\n\n__**Streak**__: ${navbar}`;
		if(amount !== 200) message += `\n\`${msg.author.tag}\` collected daily streak \`+250\` 🍫. total \`450\` 🍫`;
		
		if(user.id === msg.author.id){
			authorprof.coins +=amount
		}else{
			userprof.coins += amount
			client.userprof.set(user.id, userprof);
		}
		
		authorprof.time.lastDaily = now;
		authorprof.time.nextDay = now+(8.64e+7);
		
		client.userprof.set(msg.author.id, authorprof);
		
		return msg.channel.send(message);
	}catch(e){
		return msg.channel.send(`an error occured \`\`\`${e.stack}\`\`\``);
	}
}

function isStreak(now, time){
	now = moment(now).add(10, 'days').calendar();
	time = moment(time).add(10, 'days').calendar();
	return now === time;
}

exports.info = {
	name: 'daily',
	description: 'collect your daily',
	usage: 'daily [user]',
	aliases: ['dly'],
	ownerOnly: false,
	authorPerm: [],
	clientPerm: [],
	cooldown: 0
}