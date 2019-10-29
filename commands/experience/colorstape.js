exports.run = async (client, msg, args) => {
	let userprof = client.userprof.got(msg.author.id);
	try{
		if(!args.length){
			userprof.colorstape = client.userprof.config.colorstape;
			msg.channel.send('✅ **| Set color stape to default**');
		}else{
			args = args.join(' ');
			if(!args.includes('#') && args.toLowerCase() !== 'random') args = '#' + args;
			userprof.colorstape = args;
			msg.channel.send(`✅ **| Set the color stap to \`${args.toUpperCase()}\`**`);
		}
		return client.userprof.set(msg.author.id, userprof);
	}catch(e){
		return msg.channel.send(`an error occured \`\`\`${e.stack}\`\`\``);
	}
}

exports.info = {
	name: 'setcolorstape',
	description: 'set color stape for profile card. you can input \`random\` to random color',
	usage: 'setcolorstape [hex color | random]',
	aliases: ['setcs'],
	ownerOnly: false,
	authorPerm: [],
	clientPerm: [],
	cooldown: 0
}