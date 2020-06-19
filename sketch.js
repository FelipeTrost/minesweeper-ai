const rows = 12
const cols = 12

const bombsAmount = 30;
let grid, w;

let gameOver = false

//buttons
let restartB;
//bombsRemaining

function mousePressed() {
    const col = Math.floor(mouseY / (height / cols))
    const row = Math.floor(mouseX / (width / rows))

    if (col > cols - 1 || row > rows - 1)
        return false

    if (mouseButton === RIGHT)
        grid[col][row].disable();
    else
        callReveal(col, row)
}

function callReveal(c, r) {
    if (grid[c][r].reveal() == 'mine') {
        for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows; r++) {
                grid[c][r].revealed = true;
            }
        }
        gameOver = true
    }
}

function setup() {
    createCanvas(500, 500);

    //Restart variables
    gameOver = false;
    if (restartB)
        restartB.remove()
    restartB = undefined;

    //width for all rectangles
    w = height / cols;

    //populates global grid variable with grid
    getGrid()
}

function draw() {
    background(255);

    //show all cells
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            grid[c][r].show()
        }
    }

    if (gameOver && !restartB) {
        restartB = createButton('Restart');
        restartB.position(19, 19);
        restartB.mousePressed(setup);
    }

}