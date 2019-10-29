const Canvas = require('canvas');
const GIFEncoder = require('gifencoder');
const readFile = require('util').promisify(require('fs').readFile);
const { RichEmbed } = require('discord.js');
const { join } = require('path');
const { get } = require('node-superfetch');

exports.run = async (client, msg, args) => {
	const user = msg.mentions.users.first() || client.users.get(args[0]) || msg.author;
	try{
		const mDel = await msg.channel.send('🖌️ **| Painting...**');
		const link = user.displayAvatarURL.replace(/\.(gif|jpg|png|jpeg)\?size=2048/g, '.png?size=512');
		const { body } = await get(link);
		const attachment = await getTriggered(body);
		await msg.channel.send({file:{attachment, name: 'triggered.gif'}});
		return await mDel.delete();
	}catch(e){
		return msg.channel.send(`Oh no an error occured :( \`${e.message}\` try again later`);
	}
}

function streamToArray(stream) {
	if (!stream.readable) return Promise.resolve([]);
	return new Promise((resolve, reject) => {
		const array = [];
		function onData(data) {
			array.push(data);
		}
		function onEnd(error) {
			if (error) reject(error);
			else resolve(array);
			cleanup();
		}
		function onClose() {
			resolve(array);
			cleanup();
		}
		function cleanup() {
			stream.removeListener('data', onData);
			stream.removeListener('end', onEnd);
			stream.removeListener('error', onEnd);
			stream.removeListener('close', onClose);
		}
		stream.on('data', onData);
		stream.on('end', onEnd);
		stream.on('error', onEnd);
		stream.on('close', onClose);
	});
}

async function getTriggered(triggered) {
	const imgTitle = new Canvas.Image();
	const imgTriggered = new Canvas.Image();
	const encoder = new GIFEncoder(256, 256);
	const canvas = new Canvas.createCanvas(256, 256);
	const ctx = canvas.getContext('2d');
	imgTitle.src = await readFile(join(__dirname, '../../assets/images/plate_triggered.png'));
	imgTriggered.src = triggered;

	const stream = encoder.createReadStream();
	encoder.start();
	encoder.setRepeat(0);
	encoder.setDelay(50);
	encoder.setQuality(200);

	const coord1 = [-25, -33, -42, -14];
	const coord2 = [-25, -13, -34, -10];

	for (let i = 0; i < 4; i++) {
		ctx.drawImage(imgTriggered, coord1[i], coord2[i], 300, 300);
		ctx.fillStyle = 'rgba(255 , 100, 0, 0.4)';
		ctx.drawImage(imgTitle, 0, 218, 256, 38);
		ctx.fillRect(0, 0, 256, 256);
		encoder.addFrame(ctx);
	}
	encoder.finish();
	return streamToArray(stream).then(Buffer.concat);
}

exports.info = {
	name: 'triggered',
	description: 'Trigger some user',
	usage: 'triggered [user]',
	aliases: ['trigger'],
	ownerOnly: false,
	authorPerm: [],
	clientPerm: ['ATTACH_FILES'],
	cooldown: 10
}