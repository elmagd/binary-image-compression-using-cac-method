var windWidth;
var windHeight;

var counter = 0;

var crossover = 0.8;
var mutation = 0.003;

var generationSize = 10;

var blackOverWhite = 0.5;

var speed = 60; 

var stop = false;
var startPause = false;

var gui;

const stopInteration = 100; 
var noOfiterations = 0; 

function setup() {

	windWidth = windowWidth / 2;
	windHeight = (windowHeight / 2) * 1.5;

	createCanvas(windowWidth, windowHeight);

	frameRate(speed);

	upperLeftBuffer = createGraphics(windWidth, windHeight);
	lowerRightBuffer = createGraphics(windowWidth - windWidth, windowHeight);
	lowerLeftBuffer = createGraphics(windWidth, windowHeight-30);
	bestTillNowBuffer = createGraphics(windowWidth / 4, windowHeight - windHeight - 50);


	gui = new dat.GUI();

	gui.add(this, 'crossover', 0, 1, 0.01).name("Crossover Prob").onChange(
		function () { genetic.setCrossOver(crossover) }
	);

	gui.add(this, 'mutation', 0, 0.1 , 0.001 / 10).name("Mutation Prob").onChange(
		function () { genetic.setMutation(mutation) }
	);

	gui.add(this, 'generationSize', 1, 25, 1).name("Generation Size:").onFinishChange(
		function () {
			genetic.generatePopulation(generationSize);
			genetic.calcFitness();
		}
	);

	genetic = new Genetic();
	genetic.setImageRowColSize(70);
	genetic.createImage();

	gui.add(this, 'blackOverWhite', 0, 1, 0.01).name("BlackOverWhite").onChange(
		function () {
			genetic.image.generatePixels();
			genetic.generatePopulation(generationSize);
			startPause = false;
			genetic.calcFitness();
		}
	);

	gui.add(this, 'start').name("Start/Pause");
	// gui.add(this, 'stopLoop').name("Stop");

	genetic.image.generatePixels();
	genetic.setCrossOver(crossover);
	genetic.setMutation(mutation);

	genetic.generatePopulation(generationSize);

	genetic.calcFitness();
}

function draw() {

	if(noOfiterations >= stopInteration) { 
		alert("Iterations Exceeded The Allowed Number (100)\n" + genetic.getPop());
		noLoop();
	}  

	if (startPause) noOfiterations++; 

	drawUpperLeftBuffer();
	image(upperLeftBuffer, 0, 0);
	upperLeftBuffer.noStroke();

	image(lowerRightBuffer, windWidth, 0, windowWidth / 2, windowHeight - 200);
	image(bestTillNowBuffer, windWidth, windowHeight - 200, windowWidth / 2, 200);

	// genetic.drawStats();
	image(lowerLeftBuffer, windWidth, 0, windWidth, windowHeight -30);

	// bestTillNowBuffer = createGraphics(bestTillNowBuffer, windowHeight - windHeight - 50);
}

function drawUpperLeftBuffer() {
	upperLeftBuffer.background(140);
	if (blackOverWhite === 0.5) {
		upperLeftBuffer.stroke(150);
	}
	if (blackOverWhite >= 0.5) {
		upperLeftBuffer.background(255);
	}

	if (blackOverWhite <= 0.5) {
		upperLeftBuffer.background(0);
	}

	if (startPause) {

		// console.log("drawing and solving"); 
		genetic.image.drawImage(windWidth, windHeight);
		genetic.nextGeneration();
	}
	else {
		// console.log("stop solving");
		genetic.image.drawImage(windWidth, windHeight);
	}
}


function start() {
	startPause = !startPause;
	redraw();
	if (startPause) { 
		speed = 60;
	}
	else speed = 60;
	console.log("start");
}

function stopLoop() {
	if (!stop) {
		stop = !stop; noLoop();
		console.log("STOP");
	}
	else {
		stop = !stop;
		loop();
		console.log("STOP");
	}
}

function randomBinary() {
	// return ((random(1) * random(40) >= 1)? 1 : 0);
	var x = random(1);
	return round(x > blackOverWhite * 0.1 ? 1 : 0);
}