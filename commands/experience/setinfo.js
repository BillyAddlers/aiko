exports.run = async (client, msg, args) => {
	let userprof = client.userprof.got(msg.author.id);
	try{
		if(!args.length){
			userprof.note = client.userprof.config.note;
			await msg.channel.send('✅ **| Info set to default**');
		} else {
			if(args.join(' ').length > 84) return msg.channel.send('❌ **| Only `84` character you can provided**');
			userprof.note = args.join(' ');
			await msg.channel.send('✅ **| Succes change Info**'); 
		}
		return client.userprof.set(msg.author.id, userprof);
	}catch(e){
		return msg.channel.send(`an error occured \`\`\`${e.stack}\`\`\``);
	}
}

exports.info = {
	name: 'setinfo',
	description: 'set your profile info',
	usage: 'setinfo [text]',
	aliases: ['si'],
	ownerOnly: false,
	authorPerm: [],
	clientPerm: [],
	cooldown: 0
}