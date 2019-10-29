const { getCooldown } = require('../../util/LevelingUtil.js');

exports.run = async (client, msg, args) => {
	const user = msg.mentions.users.first() || client.users.get(args[0]);
	let authorprof = client.userprof.got(msg.author.id);
	try{
		const cooldown = getCooldown(authorprof.time.lastRep, 8.64e+7, 'h [hours] m [minutes] s [seconds]');
		if(cooldown) return msg.channel.send(`⏱️ **| ${msg.author.toString()} you can give reputation again in \`${cooldown}\`**`);
		if(!user) return msg.channel.send(`✅ **| ${msg.author.toString()} you can give reputation now**`);
		if(user.bot) return msg.channel.send(`🤖 **| ${msg.author.toString()} you can't give reputation to bot**`);
		if(user.id === msg.author.id) return msg.channel.send(`❌ **| ${msg.author.toString()} you can't give reputation to yourselft**`);
		
		let userprof = client.userprof.got(user.id);
		
		authorprof.time.lastRep = Date.now();
		userprof.rep += 1;
		
		client.userprof.set(msg.author.id, authorprof);
		client.userprof.set(user.id, userprof);
		return msg.channel.send(`🔶 **| Hey ${user.toString()} you got reputation point from \`${msg.author.tag}\`**`);
	}catch(e){
		return msg.channel.send(`an error occured \`\`\`${e.stack}\`\`\``);
	}
}

exports.info = {
	name: 'rep',
	description: 'give someone reputation point',
	usage: 'rep [user]',
	aliases: [],
	ownerOnly: false,
	authorPerm: [],
	clientPerm: [],
	cooldown: 0
}