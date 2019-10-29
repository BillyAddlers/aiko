this.userResolvable = (guild, input, random = false) => {
	const member = this.memberResolvable(guild, input, random);
	if(!member) return member;
	return member.user;
}

this.memberResolvable = (guild, input, random = false) => {
	if(USER_PATTERN.test(input)) input = input.replace(USER_PATTERN, '$1');
	let members = guild.members.filter(userFilter(input));
	if(!members.size && random){
		const keys = guild.members.keyArray();
		const randomKey = keys[Math.floor(Math.random()*keys.length)%keys.length];
		members.set(randomKey, guild.members.get(randomKey));
	}
	return members.first();
}

function userFilter(input){
	return member => member.user.id === input ||
		member.displayName.toLowerCase().includes(input.toLowerCase()) ||
		member.user.username.toLowerCase().includes(input.toLowerCase()) ||
		member.user.tag.toLowerCase().includes(input.toLowerCase());
}

var USER_PATTERN = /^(?:<@!?)?([0-9]+)>?$/;