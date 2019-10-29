const { HighChartsConstructor } = require('chart-constructor')
const { RichEmbed } = require('discord.js');
const { version, dependencies } = require('../../package.json');
const moment = require('moment');
require('moment-duration-format');

exports.run = async (client, msg, args) => {
	try{
		const embed = new RichEmbed()
		.setColor('RANDOM')
		.setTitle('My Current statistic')
		.setThumbnail(client.user.displayAvatarURL)
		.setDescription(`\`\`\`ini
Memory Usage   : ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB
Uptime         : ${moment.duration(client.uptime).format('hh:mm:ss', { trim: false })}
CPU            : ${Math.round(require('os').loadavg()[0] * 100) / 100}%
Users          : ${client.users.size.toLocaleString()}
Channels       : ${client.channels.size.toLocaleString()}
Servers        : ${client.guilds.size.toLocaleString()}
WS ping        : ${client.ping.toFixed(2)}ms
Discord.js     : v${require('discord.js/package.json').version}
Node           : ${process.version}
Version Bot    : v${version}\`\`\``)
		.addField('📌 Owners', client.config.owners.map(x => `• ${client.users.get(x).tag}`).join(',\n'))
		.addField('📌 Dependencies', Object.entries(dependencies).map(x => parseDependencies(x[0], x[1])).join(', '));
		
		if(args[0] === '--charts'){
			const attachment = await new HighChartsConstructor()
			.plotOptionsOptions(plotOptions)
			.seriesDataSetter([
				{
					type: 'line',
					color: '#3498DB',
					data: client.health.ram.slice(-10),
					name: 'RAM (Used)'
				},
				{
					type: 'line',
					color: '#FF8000',
					data: client.health.prc.slice(-10),
					name: 'RAM (Total)'
				}
			])
			.titleOptions({ text: 'Chart' })
			.toBuffer();
			
			embed.attachFile({attachment, name: 'chart.pngs'})
			.setImage('attachment://chart.png');
		}
		
		return msg.channel.send(embed);
	}catch(e){
		return msg.channel.send(`an error occured \`\`\`${e.stack}\`\`\``);
	}
}

function parseDependencies (name, src){
	if(src.startsWith('github:')){
		const repo = src.replace('github:', '').split('/');
		return `[${name}](https://github.com/${repo[0]}/${repo[1].replace(/#.+/, '')})`;
	}
	return `[${name}](https://npmjs.com/${name})`;
}

const now = new Date();
var plotOptions = {
	series: {
		pointStart: now.setHours(now.getHours() - 1),
		pointInterval: 60000
	}
}

exports.info = {
	name: 'stats',
	description: 'show current statistic bot',
	usage: 'stats',
	aliases: [],
	ownerOnly: false,
	authorPerm: [],
	clientPerm: ['EMBED_LINKS'],
	cooldown: 0
}