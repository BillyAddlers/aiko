const { getLevel, gainedXp } = require('../util/LevelingUtil.js');
const recent = new Set();

module.exports = (client, msg) => {
	if(recent.has(msg.author.id)) return;
	let userprof = client.userprof.got(msg.author.id);
	userprof.xp += gainedXp();
	if(getLevel(userprof.xp) > userprof.level){
		userprof.level = getLevel(userprof.xp);
		//msg.channel.send(`🆙 **| ${msg.author.toString()} Leveled up to \`${userprof.level}\`**`);
	}
	recent.add(msg.author.id);
	client.setTimeout(() => recent.delete(msg.author.id), 60000);
	return client.userprof.set(msg.author.id, userprof);
}