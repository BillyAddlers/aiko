const Enmap = require('enmap');

class UseprofEnmap extends Enmap {
	constructor(...args){
		super(...args);
	}
	
	got(key){
		let userprof = this.get(key) || this.config;
		userprof.id = key;
		return userprof;
	}
	
	get config(){
		return {
			xp: 0,
			level: 0,
			coins: 0,
			rep: 0,
			time: {
				lastDaily: 0,
				lastRep: 0,
				nextDay: 0
			},
			streak: 0,
			playlist: [],
			note: 'Im funny person in here',
			bg: 'https://cdn.discordapp.com/attachments/489058381794115599/499835221038989312/paus.png',
			colorstape: 'random',
			badge: {
				owned: [],
				show: new Array(3).fill(undefined)
			}
		}
	}
	
	get currency (){
		return {
			icon: '🍫',
			name: 'Chocolate'
		}
	}
}

module.exports = { UseprofEnmap }