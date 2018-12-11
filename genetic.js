function Genetic () { 
	$this = new Object();

	var crossOver = 0.7; 
	var mutation = 0.01; 

	$this.imageWidth =  parseInt(26); 
	$this.imageHeight = parseInt(26);

	$this.history = []; 

	$this.setImageRowColSize = function(value) {
		$this.imageWidth = $this.imageHeight = parseInt(value); 
	};

	$this.setCrossOver = function(value) { 
		crossOver = value; 
	};
	$this.getCrossOver = function() { return crossOver }; 


	$this.setMutation = function(value) { 
		mutation = value; 
	};
	$this.getMutation = function() { return mutation }; 


	$this.population = []; 

	$this.createImage = function() { 
		$this.image = new BinaryImage($this.imageWidth, $this.imageHeight);
	}
	
	$this.generatePopulation = function (populationMax) {
		$this.population = []; 
		for(var i=0; i<populationMax; i++) { 

			x = randomInt($this.imageWidth);
			y = randomInt($this.imageHeight);

			var p = getNearestLowDivisor($this.imageWidth, x);  
			var q = getNearestLowDivisor($this.imageHeight, y);  
			
			$this.population.push(new Chromosome(parseInt(p), parseInt(q)));
		}
	}

	$this.drawStats = function() {
		if(!startPause) return; 
		
		windowDist = Math.sqrt(Math.pow($this.imageWidth, 2) + Math.pow($this.imageHeight, 2));

		lowerLeftBuffer.background(255);  
		lowerLeftBuffer.stroke(255, 0, 0); 
		lowerLeftBuffer.strokeWeight(1.5); 

		var dist = 0;  
		lowerLeftBuffer.beginShape(); 
		
		for(var i=0; i<$this.history.length; i++) { 
			dist = Math.sqrt(Math.pow($this.history[i].x, 2) + 
				Math.pow($this.history[i].y, 2));
			
			dist = map(dist, 1, windowDist, 20, lowerLeftBuffer.height - 40);
			
			// console.log(x); 
			lowerLeftBuffer.vertex(i * 2, dist); 
		}

		lowerLeftBuffer.endShape(); 
		if($this.history.length > lowerLeftBuffer.width/2) {
			$this.history.splice(0, 1);
		}
	}

	$this.calcFitness = function () {
		var whiteBits = ''; 
		var blackBits = ''; 
		var mixedBits = ''; 

		var lengthAfterEncoding = 0; 
		var sumOfAllLengths= 0; 
		
		var s = ""; 
		for(var i=0; i<$this.population.length; i++) 
		{ 
			whiteBits = blackBits = mixedBits = ''; 
			lengthAfterEncoding = 0; 

			imageMeta = $this.image.scanImage($this.population[i].p, 
				$this.population[i].q);
		
			if((imageMeta.numMixed >= imageMeta.numBlack) && 
				(imageMeta.numMixed >= imageMeta.numWhite)) {
				mixedBits =  '0'; 
				whiteBits = '10'; 
				blackBits = '11'; 
			}
			else if((imageMeta.numWhite > imageMeta.numBlack) && 
				(imageMeta.numWhite > imageMeta.numMixed)) { 
				whiteBits =  '0'; 
				blackBits = '11';	
				mixedBits = '10'; 
			}
			else { 
				blackBits =  '0';
				whiteBits = '11'; 
				mixedBits = '10'; 
			}

			lengthAfterEncoding += whiteBits.length * imageMeta.numWhite; 
			lengthAfterEncoding += blackBits.length * imageMeta.numBlack; 
			lengthAfterEncoding += mixedBits.length * imageMeta.numMixed + 
					$this.population[i].p * $this.population[i].q * imageMeta.numMixed; 

			lengthAfterEncoding = lengthAfterEncoding/($this.imageWidth * $this.imageHeight); 

			$this.population[i].fitness = lengthAfterEncoding; 
			
			sumOfAllLengths += $this.population[i].fitness;    

			$this.history.push({x: $this.population[i].p ,y:$this.population[i].q })


			// console.log(i, 
			s +="W:"+imageMeta.numWhite +"\t"+ 
			"\tB:" + imageMeta.numBlack +"\t"+ 
			"\tM:"+imageMeta.numMixed + "\n"; 
		} // end of for loop 

		lowerRightBuffer.background(255); 
		lowerRightBuffer.textSize(14); 
		lowerRightBuffer.text(s, 220, 20); 

		console.log($this.population); 
		// console.log();  	
		var newSum = 0; 
		var str = ""; 
		for (var i = 0; i < $this.population.length; i++) 
		{  
			$this.population[i].fitness = (1 - (1/$this.population[i].fitness));
			$this.population[i].fitness *= 100;
			$this.population[i].fitness = round($this.population[i].fitness * 100)/100;	
			
			newSum += $this.population[i].fitness; 

			str += i + "\t-P:\t" + $this.population[i].p +"\tQ:\t"+ 
			$this.population[i].q +"\tFit:\t"+ $this.population[i].fitness + "\n";  
		}
		str += "\n" + "Total Prob: " + round(newSum*100)/100; 
		
		lowerRightBuffer.text(str, 20, 20);

		var prop = 0;   
		for(var i=0; i<$this.population.length; i++) { 
			prop += round (($this.population[i].fitness/newSum) * 1000)/1000; 
			$this.population[i].prob = prop;  
		}
		// lowerRightBuffer.background(255);  
	} // end of calcFitness 

	$this.nextGeneration = function() {
		nextPopulation = [];

		var winner1 = {};
		var winner2 = {};  

		var x, y; //from randomInt() 
		for(var i=0; i<$this.population.length; i++) {
			var randomNumber = random(1); 			

			if(randomNumber <= $this.getMutation()) 
			{
				console.log("mutation:", $this.getMutation());
				x = randomInt($this.imageWidth);
				y = randomInt($this.imageHeight);

				var p = getNearestLowDivisor($this.imageWidth, x);  
				var q = getNearestLowDivisor($this.imageHeight, y); 

				nextPopulation.push(new Chromosome(p, q)); 
			}
			else if(randomNumber <= $this.getCrossOver()) { 			

				console.log("crossover:", $this.getCrossOver());

				winner1 = naturalSelection($this.population);
				winner2 = naturalSelection($this.population);

				while(winner2 === winner1) winner2 = naturalSelection($this.population);
				
				randomNumber = random(1); 
				if(randomNumber >= 0.5) {
					nextPopulation.push(new Chromosome(winner1.p, winner2.p)); 

				}
				else { 
					nextPopulation.push(new Chromosome(winner2.q, winner1.q));
				}
			}
			
			else {
				winner1 = $this.population[i]; 
				nextPopulation.push(winner1); 
			}
			
		}
		$this.population = nextPopulation; 
	}

	return $this; 
}

/** 
for all members of population
    sum += fitness of this individual
end for

for all members of population
    probability = sum of probabilities + (fitness / sum)
    sum of probabilities += probability
end for

loop until new population is full
    do this twice
        number = Random between 0 and 1
        for all members of population
            if number > probability but less than next probability 
                then you have been selected
        end for
    end
    create offspring
end loop
*/

function naturalSelection(genes) { 
	var randomNumber = Math.random(1); 
	for(var i=0; i<genes.length-1; i++) { 
		if((randomNumber > genes[i].prob) && (randomNumber < genes[i + 1].prob))
			return genes[i]; 
	}
	return genes[genes.length-1]; 
}

// function naturalSelection (genes) {
// 	var x = random(100); 
// 	console.log("X", x) 
	
// 	var sum = 0; 
// 	for(var i=0; i<genes.length; i++) {
// 		// console.log(sum);
// 		if(sum >= x) { 
// 			break; 
// 		} 
// 		sum += genes[i].fitness; 
// 	}
// 	return genes[i-1];  
// }

function Chromosome (pp, qq) { 
	return { 
			p: pp, 
			q: qq, 
			fitness: 0, 
			prob: 0,  
		}; 
} 

function BinaryImage (w, h) {
	var image = { 
		width: w, 
		height: h, 
		pixels: new Array(),
		numWhite: 0,
		numMixed: 0, 
		numBlack: 0,  

		generatePixels: function() { 
			image.pixels = []; 
			for(var i=0; i<this.width; i++) {
				var array = new Array();  
				for(var j=0; j<this.height; j++) { 
					let x = randomBinary(); 
					array.push(x); 
					// console.log(x); 
				}
				// image.pixels.push(array); 
				image.pixels.push(array.reverse()); 
			}
		},

		getWidth: function () { 
			return this.width; 
		}, 

		getHeight: function () { 
			return this.height; 
		}, 

		drawImage: function(width, height) 
		{
			var rectRows =  width/this.width; 
			var rectCols =  height/this.height; 

			for(var i=0; i< this.width; i++) { 
				for(var j=0; j< this.height ; j++) {
			  		upperLeftBuffer.fill(genetic.image.pixels[i][j] * 255); 
			  		upperLeftBuffer.rect(i * rectRows, j * rectCols, rectRows, rectCols); 
			  	}
			}
		},
		
		scanImage: function(p, q) {
			// console.log("scanImage"); 
			// console.log("P, Q", p, q); 
			
			var widthIter = this.width/p; 
			var heightIter = this.height/q;

			var blocks = new Array(widthIter * heightIter);  

			// console.log("row iter, and col iter:", widthIter, heightIter) 

			this.numWhite = 0; 
			this.numBlack = 0; 
			this.numMixed = 0; 

			//blocks loop 
			var blocksCounter = 0; 
			for(var i=0; i<widthIter; i++) { 
				for(var j=0; j<heightIter; j++) {
					// console.log("start of row", i*p, ", start of col", j*q);  
					blocks[blocksCounter++] = (this.getBlock(i*p, j*q, p, q));
				}
			}

			// //TODO: scan each block and put its value either 'w', 'b', 
			// //or the block numerical values if its mixed. 
			// console.log("================================"); 
			// console.log("Blocks", blocks); 
			// console.log("================================"); 

			tempBlocks = []; 
			for(var i=0; i<blocks.length; i++) { 
				tempBlocks[i] = this.scanBlock(blocks[i], p, q); 
			} 			
			// console.log("temp: ", tempBlocks); 

			//return the blocks array with it new edith, 'w', 'b', or mixed block values; 
			return { 
						blocks: tempBlocks, 
						numWhite: this.numWhite, 
						numBlack: this.numBlack,
						numMixed: this.numMixed 
					};
		},
		
		scanBlock: function (block, w, h) {
			// console.log("scanBlock"); 
			var isWhite, isMixed; 
			isWhite = isMixed = false; 

			// console.log("Block", block); 
			// console.log("Block[0][2]", block[0][2]); 
			// console.log("w:", w, ", h:", h); 


			for(var i=0; i<w; i++) 
			{ 
				for(var j=0; j<h; j++) 
				{
					if(block[i][j] == 1) { 
						isWhite = true;
					}
					else {
						if(isWhite === true) { 
							isWhite = false; 
							isMixed = true;
							break; 
						}  
					}
				}
				if(isMixed === true) break; 
			
			} // end of second loop 

			if(isWhite) { 
				this.numWhite += 1;
				return 'W'; 
			} 
			
			else if(isMixed) { 
				this.numMixed += 1;
				return block; 
			} 
			
			this.numBlack += 1;
			return 'B';  
		}, 
		
		getBlock: function(rowStart, colStart, p, q) {
			// console.log("getBlock"); 
			var block = []; 

			for(var i=rowStart; i<p+rowStart; i++) { 
				var array = []; 
				for(var j=colStart; j<q+colStart; j++) {
					array.push(this.pixels[i][j]);  
				}
				block.push(array); 
			} 

			return block; 
		}, 
	};

	// image.generatePixels(); 
	return image;  
};

function randomInt(value) { 
	var x = round(random(value));
	return (x > 0 ? x : 1); 
}


function getNearestLowDivisor(number, divisorGuid) { 
	//ignore if the number is prime, cause this in our hand (^_^)
	var y, x; 
	x = y = divisorGuid; 

	var rand = random(100);
	
	if(rand >= 50) {
		while(number % x && x <= number) --x;
		return x; 
	} 
	else {
		while(number % y && y <= number) ++y;
		return y;  
	}
	// if(Math.abs(y-divisorGuid) > Math.abs(divisorGuid-x)) return y; 
}

// used only if number of pixels per row, or col is prime number 
function isPrime(num) {
  for(var i = 2; i < num; i++)
    if(num % i === 0) return false;
  return num !== 1 && num !== 0;
}