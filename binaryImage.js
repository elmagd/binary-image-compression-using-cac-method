function BinaryImage(w, h) {
    var $this = new Object();

    $this.width = w;
    $this.height = h;
    $this.numWhite = 0;
    $this.numMixed = 0;
    $this.numBlack = 0;
    $this.pixels = new Array();

    $this.generatePixels = function () {
        $this.pixels = [];
        for (var i = 0; i < $this.width; i++) {
            var array = new Array();
            for (var j = 0; j < $this.height; j++) {
                let x = randomBinary();
                array.push(x);
                // console.log(x); 
            }
            // $this.pixels.push(array); 
            $this.pixels.push(array.reverse());
        }
    };

    $this.getWidth = function () {
        return $this.width;
    };

    $this.getHeight = function () {
        return $this.height;
    };

    $this.drawImage = function (width, height) {
        var rectRows = width / $this.getWidth();
        var rectCols = height / $this.getHeight();

        for (var i = 0; i < $this.width; i++) {
            for (var j = 0; j < $this.height; j++) {
                upperLeftBuffer.fill($this.pixels[i][j] * 255);
                upperLeftBuffer.rect(i * rectRows, j * rectCols, rectRows, rectCols);
            }
        }
    };

    $this.scanImage = function (p, q) {
        var widthIter = $this.width / p;
        var heightIter = $this.height / q;

        var blocks = new Array(widthIter * heightIter);

        $this.numWhite = 0;
        $this.numBlack = 0;
        $this.numMixed = 0;

        //blocks loop 
        var blocksCounter = 0;
        for (var i = 0; i < widthIter; i++) {
            for (var j = 0; j < heightIter; j++) {
                // console.log("start of row", i*p, ", start of col", j*q);  
                blocks[blocksCounter++] = ($this.getBlock(i * p, j * q, p, q));
            }
        }

        // console.log("================================");
        // console.log("Blocks", blocks);
        // console.log("================================");

        tempBlocks = [];
        for (var i = 0; i < blocks.length; i++) {
            tempBlocks[i] = $this.scanBlock(blocks[i], p, q);
        }
        
        // console.log("temp: ", tempBlocks); 

        //return the blocks array with it new edith, 'w', 'b', or mixed block values; 
        return {
            blocks: tempBlocks,
            numWhite: $this.numWhite,
            numBlack: $this.numBlack,
            numMixed: $this.numMixed
        };
    };

    $this.scanBlock = function (block, w, h) {
        // console.log("scanBlock"); 
        var isWhite, isBlack;
        isWhite = isBlack = false;

        for (var i = 0; i < w; i++) {
            for (var j = 0; j < h; j++) {
                if (block[i][j] === 1) {
                    isWhite = true;
                }
                else if (block[i][j] === 0) {
                    isBlack = true;
                }
                else if (isWhite && isBlack) {
                    break;
                }
            }
            if (isWhite && isBlack) break;

        } // end of second loop 

        if (isWhite && !isBlack) {
            $this.numWhite += 1;
            return 'W';
        }

        else if (isBlack && !isWhite) {
            $this.numBlack += 1;
            return 'B';

        }
        $this.numMixed += 1;
        return block;
    };

    $this.getBlock = function (rowStart, colStart, p, q) {
        // console.log("getBlock"); 
        var array = [];
        var block = [];
        var rowEnd = p + rowStart;
        var colEnd = q + colStart;

        for (var i = rowStart; i < rowEnd; i++) {
            array = [];
            for (var j = colStart; j < colEnd; j++) {
                array.push($this.pixels[i][j]);
            }
            block.push(array);
        }

        return block;
    }
    return $this;
};