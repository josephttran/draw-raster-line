const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let width = canvas.width;
let height = canvas.height;

/* set row, column, border, number pixel for cell from text field,
    convert text to integer
*/
let row = parseInt(document.getElementById('row').value);
let column = parseInt(document.getElementById('column').value);
let border = parseInt(document.getElementById('border').value);
let numPixel = parseInt(document.getElementById('cellSize').value);
let totPixel = numPixel + border;

let isMouseDown = false;
/* first coordinate when mouse press down */
let x1 = 0;
let y1 = 0;
/* second coordinate when mouse release */
let x2 = 0;
let y2 = 0;

/* width of guide line drawn */
const lineWidth = 5;
const lineColor = 'green';

/* make grid */
function display(){
    let x = 0;
    let y = 0;    
    width = canvas.width = column * (totPixel);
    height = canvas.height = row * (totPixel);

    ctx.strokeRect(0, 0, width, height);
    ctx.strokeStyle='#000000';
    ctx.lineWidth = border;

    for(let i = 0; i < row; i++){
        for(let j = 0; j < column; j++){
            ctx.strokeRect(x, y, totPixel, totPixel);
            x += totPixel;
        }
        x = 0;
        y += totPixel;       
    }
};

/* mousedown event */
canvas.addEventListener('mousedown', (e) => {   
    isMouseDown = true;
    [x1, y1] = [e.offsetX, e.offsetY];
});

/* mousemove event */
canvas.addEventListener('mousemove',  (e) => {  
    let mousePos = getMousePos(ctx, e);
    let status = document.getElementById("mousePosition");
    status.innerHTML = "(" + mousePos.x +", "+ mousePos.y +")"; 

    if (!isMouseDown) return;

    reDrawStoredLines();
    let x = x1 % totPixel;
    let y = y1 % totPixel;
    ctx.fillStyle = 'blue';    
    ctx.fillRect(x1 - x, y1 - y, totPixel, totPixel);
    drawLine(x1, y1, e.offsetX, e.offsetY);
});

/* mouseup event */
canvas.addEventListener('mouseup',  (e) => {
    isMouseDown = false;

    [x2, y2] = [e.offsetX, e.offsetY];
    /* store coordinates of start and end of lines */
    storedLines.push({startX:x1, startY:y1, endX:x2, endY:y2})
    reDrawStoredLines();
});

/* redraw lines */
let storedLines = [];
function reDrawStoredLines(){  
    ctx.clearRect(0, 0, width, height);
    display();

    if (storedLines.length === 0) return;

    let x1, y1, x2, y2;
    for(let i = 0; i < storedLines.length; i++){
        x1 = storedLines[i].startX; 
        y1 = storedLines[i].startY;
        x2 = storedLines[i].endX; 
        y2 = storedLines[i].endY;
        lineBresenham(x1, y1, x2, y2);
    }
};

/* Draw line from coordinate (x1, y1) to (x2, y2) */
function drawLine(x1, y1, x2, y2){
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
};

/* Get mouse position */
function getMousePos(ctx, e) {
    return {
      x: e.clientX - ctx.canvas.offsetLeft,
      y: e.clientY - ctx.canvas.offsetTop
    };
};

/* Set pixel, draw box start from top left of cell */
function setPixel(x, y){
    let xRe = x % totPixel;
    let yRe = y % totPixel;
    ctx.fillStyle = 'cyan';    
    ctx.fillRect(x - xRe + border/2, y - yRe + border/2, numPixel, numPixel);
};

/* Bresenham's line algorithm set pixels, modified step */
function lineBresenham(x1, y1, x2, y2){
    let dx, dy;
    let stepX, stepY;
    
    dx = x2 - x1;
    dy = y2 - y1;

    if (dy < 0) {
        dy = -dy;
        stepY = -totPixel;
    } else {
        stepY = totPixel;
    }
    if (dx < 0) {
        dx = -dx;
        stepX = -totPixel;
    } else {
        stepX = totPixel;
    }
    /* 2dy, 2dx */
    dy << 1;
    dx << 1;

    if ((0 <= x1) && (x1 < width) && (0 <= y1) && (y1 < height)) {
        setPixel(x1, y1);
    }
    /* slope between 1 and -1, greater than 1, less than -1 */
    if (dx > dy) {
        let fraction = dy - (dx >> 1);
        while(x1 < x2){
            x1 += stepX;
            if (fraction >= 0) {
                y1 += stepY;
                fraction -= dx;
            }
            fraction += dy;
            if ((0 <= x1) && (x1 < width) && (0 <= y1) && (y1 < height)) {
                setPixel(x1, y1);
            }
        }
    } else if (y1 > y2) {
        let fraction = dx - (dy >> 1);
        while(y1 > y2){
            if(fraction >= 0){
                x1 += stepX;
                fraction -= dy;
            }
            y1 += stepY;
            fraction += dx;
            if((0 <= x1) && (x1 < width) && (0 <= y1) && (y1 < height)){
                setPixel(x1, y1);
            }
        }
    } else {
        let fraction = dx - (dy >> 1);
        while(y1 < y2){
            if (fraction >= 0) {
                x1 += stepX;
                fraction -= dy;
            }
            y1 += stepY;
            fraction += dx;
            if ((0 <= x1) && (x1 < width) && (0 <= y1) && (y1 < height)) {
                setPixel(x1, y1);
            }
        }
    }
};

/* button function, empty stored lines, clear pixels set, clear canvas, redraw grid */
function clearLine() {
    storedLines.length = 0;
    ctx.clearRect(0, 0, width, height);
    display();
};

/* When enter is pressed, update row value */
document.getElementById('row').addEventListener("keydown", function(e) {
    if (e.keyCode === 13) {
        row = parseInt(document.getElementById('row').value);
        clearLine();
    }
}, false);

/* When enter is pressed, update column value */
document.getElementById('column').addEventListener("keydown", function(e){
    if (e.keyCode === 13) {
        column = parseInt(document.getElementById('column').value);
        clearLine();
    }
}, false);

/* When enter is pressed, update numPixel and total pixel */
document.getElementById('cellSize').addEventListener("keydown", function(e){
    if (e.keyCode === 13) {
        numPixel = parseInt(document.getElementById('cellSize').value);
        totPixel = numPixel + border;
        clearLine();
    }
}, false);

/* When enter is pressed, update border and total pixel */
document.getElementById('border').addEventListener("keydown", function(e){
    if (e.keyCode === 13) {
        border = parseInt(document.getElementById('border').value);
        totPixel = numPixel + border;
        clearLine();
    }
}, false);