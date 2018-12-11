var windWidth; 
var windHeight; 

var counter = 0; 

var crossover = 0.7; 
var mutation = 0.01; 

var generationSize = 10; 

var blackOverWhite = 0.5; 

var speed = 15;

var stop = false; 
var startPause = false; 

var gui; 

function setup() {
	
	windWidth = windowWidth/2; 
	windHeight =(windowHeight/2) * 1.5;

	createCanvas(windowWidth, windowHeight); 
	
	frameRate(speed); 
	
	upperLeftBuffer = createGraphics(windWidth, windHeight);
	lowerLeftBuffer = createGraphics(windWidth/2, windowHeight-windHeight-50);
	lowerRightBuffer = createGraphics(windowWidth-windWidth, windowHeight);


	gui = new dat.GUI(); 

	gui.add(this, 'crossover', 0, 1, 0.01).name("Crossover Prob").onFinishChange(
		function () { genetic.setCrossOver(crossover) } 
	); 

	gui.add(this, 'mutation', 0, 0.3, 0.3/10).name("Mutation Prob").onFinishChange(
		function () { genetic.setMutation(mutation) }
	); 

	gui.add(this, 'generationSize', 1, 100, 2).name("Generation Size:").onFinishChange(
		function () { 
			genetic.generatePopulation(generationSize);
		}
	); 

	genetic = new Genetic();
	genetic.setImageRowColSize(20); 
	genetic.createImage();

	gui.add(this, 'blackOverWhite', 0, 1, 0.01).name("BlackOverWhite").onChange(
		function () { 
			genetic.image.generatePixels(); 
			genetic.generatePopulation(generationSize);  
			startPause = false; }
	); 

	gui.add(this, 'start').name("Start/Pause"); 	
	gui.add(this, 'stopLoop').name("Stop"); 

	genetic.image.generatePixels();
	genetic.setCrossOver(crossover); 
	genetic.setMutation(mutation); 

	genetic.generatePopulation(generationSize); 
	// console.log(genetic);  
	// noLoop(); 
}

function draw() {
	if(!stop) noLoop(); 
	// strokeWeight(10);  
	drawUpperLeftBuffer();  
	image(upperLeftBuffer, 0, 0); 
	upperLeftBuffer.noStroke(); 

	image(lowerRightBuffer, windWidth, 0, windWidth, windowHeight); 

	genetic.drawStats(); 
	image(lowerLeftBuffer, 0, windHeight, windWidth, windowHeight-windHeight); 
}

function drawUpperLeftBuffer() {
	upperLeftBuffer.background(140);
	if(blackOverWhite === 0.5) {
		upperLeftBuffer.stroke(150);	
	}
	if(blackOverWhite >= 0.5) {
		upperLeftBuffer.background(255);	
	}
	
	if(blackOverWhite <= 0.5) {	
		upperLeftBuffer.background(0);	
	}

	if(startPause) {
		// console.log("drawing and solving"); 
		genetic.image.drawImage(windWidth, windHeight); 
		genetic.calcFitness();	
		genetic.nextGeneration();  
	}
	else { 
		console.log("stop solving"); 
		genetic.image.drawImage(windWidth, windHeight);
	}
}


function start() {
	startPause = !startPause;
	redraw();  
	if(startPause) speed = 15;
	else speed = 15;
	console.log("start"); 
}

function stopLoop() { 
	if(!stop) 
	{ stop = !stop; noLoop(); } 

	else 
	{ stop = !stop; loop(); }
}

function randomBinary() { 
	// return ((random(1) * random(40) >= 1)? 1 : 0);
	var x = random(1); 
	return round(x > blackOverWhite? 1 : 0);
}