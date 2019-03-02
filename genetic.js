function Genetic() {
    $this = new Object();

    $this.crossOver = 0.8;
    $this.mutation = 0.003;

    $this.bestTillNow = '';
    $this.doubleBest = '';

    $this.imageWidth = parseInt(26);
    $this.imageHeight = parseInt(26);

    $this.history = [];
    $this.generationSize = 0; 

    $this.getPop = function () {
    	var popstr = '';  
    	for(var i=0; i<$this.generationSize; i++) { 
            popstr += i + " -P: " + $this.population[i].p + "  \tQ: " +
            $this.population[i].q + "  \tFit: " +
            round($this.population[i].fitness * 1000) / 1000 + "\t" + "\n";

    	}
    	return popstr; 
    }

    $this.setImageRowColSize = function (value) {
        $this.imageWidth = $this.imageHeight = parseInt(value);
    };

    $this.setCrossOver = function (value) {
        $this.crossOver = value;
    };
    $this.getCrossOver = function () { return $this.crossOver };


    $this.setMutation = function (value) {
        $this.mutation = value;
    };
    $this.getMutation = function () { return $this.mutation };


    $this.population = [];

    $this.createImage = function () {
        $this.image = new BinaryImage($this.imageWidth, $this.imageHeight);
    }

    $this.generatePopulation = function (populationMax) {
        $this.generationSize = populationMax; 
        $this.population = [];
        $this.bestTillNow = '';
        $this.doubleBest = '';

        for (var i = 0; i < populationMax; i++) {

            x = randomInt($this.imageWidth);
            y = randomInt($this.imageHeight);

            var p = getNearestDivisor($this.imageWidth, x);
            var q = getNearestDivisor($this.imageHeight, y);

            $this.population.push(new Chromosome(parseInt(p), parseInt(q)));
        }
    }


    $this.drawStats = function () {
        if (!startPause) return;

        // windowDist = Math.sqrt(Math.pow($this.imageWidth, 2) + Math.pow($this.imageHeight, 2));

        var dist = 0;

        lowerLeftBuffer.background(255);
        lowerLeftBuffer.stroke(0);
        lowerLeftBuffer.line(0, lowerLeftBuffer.height, 
        	lowerLeftBuffer.width, lowerLeftBuffer.height);
        
        lowerLeftBuffer.beginShape();
        lowerLeftBuffer.stroke(255, 0, 0);
        lowerLeftBuffer.strokeWeight(1.7);

        for (var i = 0; i < $this.history.length; i++) {
            // dist = Math.sqrt(Math.pow($this.history[i].x, 2) +
            //     Math.pow($this.history[i].y, 2));
            if($this.history[i].fit <= 30)
                dist = map($this.history[i].fit, 0, 30, lowerLeftBuffer.height, 5);
            else { 
                dist = map($this.history[i].fit, 4500, 4900, lowerLeftBuffer.height, 30);
            }
            // console.log(x); 
            var x = i* random(19, 20); 
            lowerLeftBuffer.vertex(x, dist);
            if(i == $this.generationSize) {
                lowerLeftBuffer.textSize(20); 
                lowerLeftBuffer.text(String(round($this.history[i].fit * 100) / 100), x - 5, dist); 
            }
    
            $this.history.splice(0, 1);
        }

        lowerLeftBuffer.endShape();
        // if ($this.history.length >=lowerLeftBuffer.width/3) {
        //     $this.history.splice(0, );
        // }
    }

    $this.calcFitness = function () {
        var cr = 0;
        var lengthAfterEncoding = 0;

        var whiteBits = '';
        var blackBits = '';
        var mixedBits = '';

        var blocksInfo = '';
        var fitnessInfo = '';

        var imageMetasForPop = [];

        for (var i = 0; i < $this.population.length; i++) {
            whiteBits = blackBits = mixedBits = '';
            lengthAfterEncoding = 0;

            imageMeta = $this.image.scanImage($this.population[i].p,
                $this.population[i].q);

            imageMetasForPop.push([imageMeta.numWhite, imageMeta.numBlack, imageMeta.numMixed]);

            if ((imageMeta.numMixed >= imageMeta.numBlack) &&
                (imageMeta.numMixed >= imageMeta.numWhite)) {            	
            	if(imageMeta.blackBits == 0) { 
	                mixedBits = '0';
	                whiteBits = '1';
            		blackBits = '';         		
            	}
            	else if(imageMeta.whiteBits == 0) { 
	                mixedBits = '0';
            		blackBits = '1';         		
	                whiteBits = '';	
            	}
                else { 
                	mixedBits = '0';
                	whiteBits = '10';
                	blackBits = '11';
                }
            }
            else if ((imageMeta.numWhite >= imageMeta.numBlack) &&
                (imageMeta.numWhite > imageMeta.numMixed)) {

            	if(imageMeta.numBlack == 0) { 
	                whiteBits = '1';
	                mixedBits = '0';
            		blackBits = '';         		
            	}
            	else if(imageMeta.numMixed == 0) { 
	                whiteBits = '1';	
	                mixedBits = '';
            		blackBits = '1';         		
            	}
                else { 
                	whiteBits = '0';
                	mixedBits = '10';
                	blackBits = '11';
                }

            }
            else {
            	if(imageMeta.numWhite == 0) { 
	                mixedBits = '0';
	                whiteBits = '';
            		blackBits = '1';         		
            	}
            	else if(imageMeta.numMixed == 0) { 
	                mixedBits = '';
            		blackBits = '1';         		
	                whiteBits = '0';	
            	}
            	else { 
				blackBits = '0';
                whiteBits = '11';
                mixedBits = '10';
            	}
                
            }

            lengthAfterEncoding = $this.getImageLenInBits(whiteBits, blackBits, mixedBits,
                imageMeta.numWhite, imageMeta.numBlack, imageMeta.numMixed, i);

            cr = ($this.imageWidth * $this.imageHeight) / lengthAfterEncoding;

            $this.population[i].fitness = cr;


            $this.history.push({
                x: $this.population[i].p,
                y: $this.population[i].q,
                fit: $this.population[i].fitness
            })
            // // console.log(i, 
            // blocksInfo += "W:" + imageMeta.numWhite +
            //     "  B:" + imageMeta.numBlack +
            //     "  M:" + imageMeta.numMixed + "\n";

            // fitnessInfo += i + " -P:" + $this.population[i].p + "  \tQ:" +
            //     $this.population[i].q + "  \tFit:" +
            //     round($this.population[i].fitness * 1000) / 1000 + "\t" + "\n";

        } // end of for loop 

        // lowerRightBuffer.background(255);
        // lowerRightBuffer.textSize(20);
        // lowerRightBuffer.text(fitnessInfo, 20, 20);
        // lowerRightBuffer.text(blocksInfo, 300, 20);

        // // $this.bestTillNow = ''; 
        // for (var i = 0; i < $this.population.length; i++) {
        //     if ($this.bestTillNow.length > 400) $this.bestTillNow = '';
        //     if ($this.doubleBest.length > 400) $this.bestTillNow = '';

        //     if ($this.population[i].fitness > 1 &&
        //         $this.population[i].fitness < 2) {
        //         $this.bestTillNow += i + " -P: " + $this.population[i].p +
        //             ", Q: " + $this.population[i].q +
        //             ", F: " + round($this.population[i].fitness * 100) / 100 +
        //             ", W: " + imageMetasForPop[i][0] +
        //             ", B: " + imageMetasForPop[i][1] +
        //             ", M: " + imageMetasForPop[i][2] + "\n";
        //     }
        //     else if ($this.population[i].fitness >= 2) {
        //         $this.doubleBest += i + " -P: " + $this.population[i].p +
        //             ", Q: " + $this.population[i].q +
        //             ", F: " + round($this.population[i].fitness * 100) / 100 +
        //             ", W: " + imageMetasForPop[i][0] +
        //             ", B: " + imageMetasForPop[i][1] +
        //             ", M: " + imageMetasForPop[i][2] + "\n";
        //     }
        // }

        // bestTillNowBuffer.background(255);
        // bestTillNowBuffer.textSize(7);

        // if ($this.bestTillNow === '') {
        //     bestTillNowBuffer.text("NO THING HERE", 30, 10);
        // }
        // else {
        //     bestTillNowBuffer.text($this.bestTillNow, 30, 10);
        //     // console.log("Best > 1: \n(", $this.bestTillNow,
        //     //     ")\nBest >= 2: (", $this.doubleBest + ")");
        // }
        // bestTillNowBuffer.text($this.doubleBest, 200, 10);

    } // end of calcFitness 

    $this.nextGeneration = function () {
        var tempPopulation = naturalSelection($this.population,
            $this.crossOver, $this.mutation,
            $this.imageWidth, $this.imageHeight);

        $this.population = tempPopulation; 
        $this.calcFitness(); 
        $this.drawStats(); 
        $this.population.sort(fitness_comp); 
        $this.population.splice($this.generationSize, $this.population.length-1); 
    }

    $this.getImageLenInBits = function (w, b, m, nw, nb, nm, i) {
        return ((w.length * nw) +
            (b.length * nb) +
            (m.length * nm) +
            ($this.population[i].p * $this.population[i].q * nm)
        );
    }

    return $this;
}


function Chromosome(width, height) {
    return {
        p: width,
        q: height,
        fitness: 0,
        prob: 0,
    };
}

function naturalSelection(pop, crsOverProb, mutProb, w, h) {
    var offSpring = [];
    var rand = 0;
    var value = 0;

    calcProbability(pop);

    // console.log("CrossOver: " + crsOverProb + " Mutation: " + mutProb);
    var tempPopulation = pop;  

    // loop until new population is full
    for (var i = 0; i < pop.length; i += 2) {
        //if the random number is the same as crossover prob or less than it perform crossover. 
        rand = math.random();
        value = math.random();

        if (rand <= crsOverProb) {
            newchilds = getCrossoverParents(pop);

            if(newchilds == null) continue;

            if(newchilds.firstChild == null || 
               newchilds.secondChild == null) continue;


            if (i === pop.length - 1) {
                selected = (value < 0.5 ?
                    newchilds.firstChild :
                    newchilds.secondChild);

                offSpring.push(selected);
            }
            else {
                offSpring.push(newchilds.firstChild);
                offSpring.push(newchilds.secondChild);
            }
        }
        //else put the same parents into the new offspring
        else {
            if (i == pop.length - 1) {
                offSpring.push(pop[i]);
            }
            else {
                offSpring.push(pop[i]);
                offSpring.push(pop[i + 1]);
            }
        }
        //if random is the same as mutation probability or less perform mutation. 
        rand = math.random();
        if (rand <= mutProb) {
            x = randomInt(w);
            y = randomInt(h);

            var p = getNearestDivisor(w, x);
            var q = getNearestDivisor(h, y);

            value = math.random();

            if (i == pop.length - 1) {
                offSpring[i].p = (value > 0.5 ? p : q);
                offSpring[i].q = (value < 0.5 ? p : q);
            }
            else {
            	if(offSpring[i] == undefined) continue; 

                offSpring[i].p = (value > 0.5 ? p : q);
                offSpring[i].q = (value < 0.5 ? p : q);

                x = randomInt(w);
	            y = randomInt(h);

	            p = getNearestDivisor(w, x);
	            q = getNearestDivisor(h, y);

                offSpring[i + 1].q = (value > 0.5 ? p : q);
                offSpring[i + 1].q = (value < 0.5 ? p : q);
            }
        }
    }

    if(offSpring.length > 0) 
	    for(let i=0; i<offSpring.length; i++) { 
	    	tempPopulation.push(offSpring[i]); 
	    }
    return tempPopulation;
}

function fitness_comp(a, b) { 
	if(b.fitness > a.fitness) return 1; 
	return -1; 
}


function getCrossoverParents(pop) {
    var rand = 0;
    var selected = [];
    var offSpring = { firstChild: {}, secondChild: {} };

    const reapeatTimes = 2;

    // console.log(pop); 
    // return; 

    var counter = 0;

    for (var i = 0; i < reapeatTimes; i++) {
        rand = round(math.random(100) * 1000) / 1000;

        for (var j = 0; j < (pop.length - 1); j++) {
            if ((rand > pop[j].prob) && (rand < pop[j + 1].prob)) {
                break;
            }
        }

        // console.log("j: " + j); 
        selected.push(j);
        if (i === 1) {
            if (selected[0] === selected[1]) {
                selected.splice(1, 1);
                i--;
            }
        }

        if (counter >= 1000) {
            console.log("Counter acessed the permitted value: " + counter);
            noOfIterations = 100; 
            return null; 
        }
        counter++;

    }


    offSpring.firstChild = new Chromosome(pop[selected[0]].p, pop[selected[1]].p);
    offSpring.secondChild = new Chromosome(pop[selected[1]].q, pop[selected[0]].q);

    return offSpring;
}


function calcProbability(pop) {
    var sum = 0;
    var prob = 0;

    for (var i = 0; i < pop.length; i++) {
        sum += pop[i].fitness;
    }

    // console.log(sum); 

    for (var i = 0; i < pop.length; i++) {
        prob += (pop[i].fitness / sum);
        pop[i].prob = round(prob * 100000) / 1000;
        // console.log(prob); 
    }
    // console.log(pop);
}

function randomInt(value) {
    var x = round(math.random(value+1));
    return (x > 0 ? x : 1);
}


function getNearestDivisor(number, divisorGuid) {
    //ignore if the number is prime, cause this in our hand (^_^)
    var y, x;
    x = y = divisorGuid;

    if (number > divisorGuid) {
        while (number % x) --x;
        while (number % y) ++y;
        if (Math.abs(y - divisorGuid) > Math.abs(divisorGuid - x)) return y;
        else return x; 
    }
    while (number % x)--x;
    return x; 
}

// used only if number of pixels per row, or col is prime number 
function isPrime(num) {
    for (var i = 2; i < num; i++)
        if (num % i === 0) return false;
    return num !== 1 && num !== 0;
}

