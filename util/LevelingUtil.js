const moment = require('moment');
const SI_SYMBOL = ['', 'k', 'M', 'G', 'T', 'P', 'E'];

this.getLevel = (xp) => {
	return Math.floor(0.177 * Math.sqrt(xp)) + 1;
}

this.getLevelBounds = (level) => {
	const upperBound = Math.ceil((level / 0.177) ** 2);
	const lowerBound = Math.ceil(((level - 1) / 0.177) ** 2);
	return { upperBound, lowerBound }
}

this.gainedXp = () => {
	return Math.ceil(Math.random()*9) + 3;
}

this.nFormatter = (number) => {
	const tier = Math.log10(number) / 3 | 0;
	if(!tier) return number.toString();
	const suffix = SI_SYMBOL[tier];
	const scale = Math.pow(10, tier*3);
	const scaled = number / scale;
	return `${scaled.toFixed(2)}${suffix}`;
}

this.getCooldown = (time, limit, format) => {
	require('moment-duration-format');
	const now = Date.now()
	const estimated = (time+limit) - now;
	if(estimated > 0) return moment.duration(estimated).format(format);
	return false;
}

this.verify = async (msg, user, time = 30000) => {
	await msg.react('🇾');
	await msg.react('🇳');
	const filter = (rect, usr) => ['🇾', '🇳'].includes(rect.emoji.name) && usr.id === user.id;
	const response = await msg.awaitReactions(filter, {max: 1, time});
	if(!response.size || response.first().emoji.name === '🇳') return false;
	return true;
}