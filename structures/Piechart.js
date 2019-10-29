const { Canvas } = require('canvas-constructor');

class Piechart {
	constructor(datas){
		this.datas = datas;
		this.canvas = new Canvas(400, 250);
	}
	
	draw(){
		const datas = this.datas;
		let total = 0;
		for(const { value } of datas){
			total += value;
		}
		
		let startPoint = 0;
		for(let i = 0; i < datas.length; i++){
			const percent = datas[i].value * 100/total;
			const endPoint = startPoint + (2 / 100 * percent);
			
			this.canvas = this.canvas
			.beginPath()
			.setColor(datas[i].color)
			.moveTo(100, 100)
			.arc(100, 100, 100, startPoint*Math.PI, endPoint*Math.PI)
			.fill();
			
			startPoint = endPoint;
			
			this.canvas = this.canvas
			.addRect(220, 25 * i, 15, 15)
			.setColor('black')
			.addText(`${datas[i].text} (${datas[i].value})`);
		}
		return this.canvas.toBuffer();
	}
}

module.exports = Piechart;