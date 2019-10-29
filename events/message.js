const { Collection } = require('discord.js');

module.exports = async (client, msg) => {
	try{
		if(!msg.guild || msg.author.bot ) return;
		msg.guild.prefix = client.config.prefix;
		client.emit('experience', msg);
		if(!msg.content.startsWith(client.config.prefix)) return;
		const args = msg.content.slice(client.config.prefix.length).trim().split(/ +/g);
		const command = args.shift().toLowerCase();
		
		args.missing = MissingArgs;
		const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));
		if(!cmd) return;
		if(!parseCmd(client, msg, cmd.info)) return;
		await cmd.run(client, msg, args);
		return cooldown(client, msg.author.id, cmd.info);
	}catch(e){
		return msg.channel.send(e.stack, { code: 'unu' });
	}
}

function parseCmd(client, msg, cmd){
	if(cmd.ownerOnly && !client.config.owners.includes(msg.author.id)){
		msg.channel.send(` ❌ **| ${msg.author.toString()}, Only my owners can execute this command**`);
		return false;
	}
	if(cmd.authorPerm.length){
		let perms = [];
		for(const perm of cmd.authorPerm){
			if(!msg.member.hasPermission(perm.toUpperCase())) perms.push(perm);
		}
		if(perms.length){
			msg.channel.send(`❌ **| ${msg.author.toString()}, You dont have permissions:** ${perms.map(x => `▫ | ${x}`).join('\n')}`);
			return false;
		}
	}
	if(cmd.clientPerm.length){
		let perms = [];
		for(const perm of cmd.clientPerm){
			if(!msg.guild.me.hasPermission(perm.toUpperCase())) perms.push(perm);
		}
		if(perms.length){
			msg.channel.send(`❌ **| ${msg.author.toString()}, I dont have permissions:** ${perms.map(x => `▫ | ${x}`).join('\n')}`);
			return false;
		}
	}
	if(cmd.cooldown){
		const now = Date.now();
		if(!client.cooldowns.has(cmd.name)) client.cooldowns.set(cmd.name, new Collection());
		const commandCooldown = client.cooldowns.get(cmd.name);
		const userCooldown = commandCooldown.get(msg.author.id) || 0;
		const estimatedTime = (userCooldown+(cmd.cooldown*1000)) - now;
		if(userCooldown && !client.config.owners.includes(msg.author.id) && estimatedTime > 0){
			msg.channel.send(`⏱ **| ${msg.author.toString()}, You can use this command again in \`${estimatedTime/1000}s\`**`).catch(e => msg.channel.send(e.stack, { code: 'ini' }));
			return false;
		}
		commandCooldown.set(msg.author.id, now);
		client.cooldowns.set(cmd.name, commandCooldown);
	}
	return true;
}

function cooldown(client, id, info){
	if(!info.cooldown) return;
	const cmd = client.cooldowns.get(info.name);
	cmd.set(id, Date.now());
	client.cooldowns.set(info.name, cmd);
	return;
}

function MissingArgs(msg, reason, info){
	return msg.channel.send(`
❌ | is not how you use \`${msg.guild.prefix}${info.name}\`
▫ | Reason: **${reason}**
▫ | Correct usage: \`${msg.guild.prefix}${info.usage}\`
▫ | More help use: \`${msg.guild.prefix}help ${info.name}\`
	`);
}