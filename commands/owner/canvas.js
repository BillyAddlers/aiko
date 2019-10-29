const { RichEmbed, Attachment } = require('discord.js');
const { invert, grayscale, greyscale, invertGrayscale, invertGreyscale, sepia, silhouette, threshold, invertedThreshold, brightness, myOldFriend, darkness, sharpen, blur, convolute, Canvas } = require('canvas-constructor');
const { get } = require('node-superfetch');
const { readdirSync } = require('fs');
const { join } = require('path');
const IMAGE_PATTERN = /\.(.+(Image))\(("|`|')(.+?)("|'|`)/g;

const fonts = readdirSync(join(__dirname, '../../assets/fonts'));
for(const font of fonts){
	Canvas.registerFont(join(__dirname, '../../assets/fonts', font), font.split('.')[0]);
}

exports.run = async (client, msg, args) => {
	const us = Date.now();
	let code = args.join(' ');
	try{
		const attachment = [];
		if(args[args.length-1] === '--process') return msg.channel.send(`⏏️ **| Supported process** \`\`\`${Object.keys(require('canvas-constructor')).filter(x => x !== 'Canvas').join('\n')}\`\`\``);
		if(args[args.length-1] === '--fonts') return msg.channel.send(`⏏️ **| Supported Fonts** \`\`\`${fonts.map((x,i) => `${i+1}. ${x.split('.')[0]}`).join('\n')}\`\`\``);
		if(!args.length) throw 'CommandError: Cannot execute this Command without input';
		if(!code.startsWith('new Canvas')) throw 'CommandError: You must initialize canvas with \'new Canvas(width, height)\'';
		if(IMAGE_PATTERN.test(code)){
			code = await replaceAsync(code, IMAGE_PATTERN, async (match, one, two, three, four, five) => {
				if(!/https?:\/\//g.test(four)) throw 'TypeError: the parameter \'ImageOrBuffer\' must be a valid link';
				if(attachment.map(x => x.url).includes(four)) return `.${one}(attachment[${attachment.map(x => x.url).indexOf(four)}].buffer`;
				const { raw } = await get(four);
				attachment.push({
					url: four,
					buffer: raw
				});
				return `.${one}(attachment[${attachment.map(x => x.url).indexOf(four)}].buffer`;
			});
		}
		let evaled = eval(code);
		if(!(evaled instanceof Buffer)) evaled = evaled.toBuffer();
		const embed = new RichEmbed()
		.setColor('GREEN')
		.setTitle('✅ Output')
		.attachFile(new Attachment(evaled, 'output.png'))
		.setImage('attachment://output.png')
		.setFooter(`⏱️ ${(Date.now() - us) / 1000}s`);
		return msg.channel.send(embed);
	}catch(e){
		const embed = new RichEmbed()
		.setColor('RED')
		.setTitle('🚫 An Error Occured')
		.setDescription(`\`\`\`${e || ' '}\`\`\``)
		.setFooter(`⏱️ ${(Date.now() - us) / 1000}s`);
		return msg.channel.send(embed);
	}
}

function replaceAsync(str, re, callback) {
    str = String(str);
    var parts = [],
        i = 0;
    if (Object.prototype.toString.call(re) == "[object RegExp]") {
        if (re.global)
            re.lastIndex = i;
        var m;
        while (m = re.exec(str)) {
            var args = m.concat([m.index, m.input]);
            parts.push(str.slice(i, m.index), callback.apply(null, args));
            i = re.lastIndex;
            if (!re.global)
                break; // for non-global regexes only take the first match
            if (m[0].length == 0)
                re.lastIndex++;
        }
    } else {
        re = String(re);
        i = str.indexOf(re);
        parts.push(str.slice(0, i), callback.apply(null, [re, i, str]));
        i += re.length;
    }
    parts.push(str.slice(i));
    return Promise.all(parts).then(function(strings) {
        return strings.join("");
    });
}

exports.info = {
	name: 'canvas',
	description: 'test canvas constructor code',
	usage: 'canvas <code>',
	aliases: ['cv'],
	ownerOnly: true,
	authorPerm: [],
	clientPerm: ['EMBED_LINKS', 'ATTACH_FILES'],
	cooldown: 0
}