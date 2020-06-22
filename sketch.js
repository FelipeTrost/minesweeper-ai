const rows = 20
const cols = 15

const bombsAmount = 50;
let grid;
let w = 30;

let gameOver = true
let aiOn = false

let timeBeginning;

//buttons
let restartB, toggleAI;

//display divs
let displayDiv, bombsLeftDiv;

function mousePressed() {
    const col = Math.floor(mouseY / (height / cols))
    const row = Math.floor(mouseX / (width / rows))

    if (col > cols - 1 || row > rows - 1 || col < 0 || row < 0)
        return false

    if (mouseButton === RIGHT)
        grid[col][row].disable();
    else
        callReveal(col, row)
}

function callReveal(c, r) {
    let result = grid[c][r].reveal()

    if (result == "mine") {
        grid[c][r].wall = [255, 100, 100]
        for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows; r++) {
                grid[c][r].revealed = true;
            }
        }

        gameOver = true
        // alert("Not every AI is perfect :(")
    }
    return result
}

function checkWin() {
    const disabled = disabledFields();
    let mines = bombsAmount - disabled;

    let checkDisabled = true;
    let unrevealeddAreMines = true;
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            const cell = grid[c][r]
            if (cell.disabled && !cell.mine)
                checkDisabled = false
            if (!cell.disabled && !cell.revealed && !cell.mine)
                unrevealeddAreMines = false
        }
    }

    if ((mines == 0 && checkDisabled) || unrevealeddAreMines) {
        for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows; r++) {
                grid[c][r].wall = [230, 255, 230]
                grid[c][r].revealed = true
            }
        }
        console.log("---------------------------")
        console.log("Victory!")
        console.log("---------------------------")

        gameOver = true;
    }
    return mines;
}

//Separate function to set up canvas, for the reset button
function start() {
    gameOver = false;
    //width for all rectangles
    w = height / cols;

    //populates global grid variable with grid
    getGrid()

    timeBeginning = new Date()
}

async function setup() {
    createCanvas(rows * w, cols * w);

    //Restart button
    restartB = createButton('Restart');
    // restartB.position(19, 19);
    restartB.mousePressed(start);
    //AI button
    toggleAI = createButton(aiOn ? "Turn AI Off" : "Turn AI On");
    toggleAI.mousePressed(() => {
        aiOn = !aiOn;
        toggleAI.html(aiOn ? "Turn AI Off" : "Turn AI On");
    })

    //divs
    bombsLeftDiv = createDiv("Bombs left:")
    displayDiv = createDiv("0")

    start()
}

function draw() {
    background(255);

    //show all cells
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            grid[c][r].show()
        }
    }

    if (!gameOver) {
        //update divs
        bombsLeftDiv.html("Bombs left: " + checkWin().toString())
        displayDiv.html("Time: " + Math.floor((new Date() - timeBeginning) / 100) / 10)


        //Run AI
        if (aiOn && !aiMove() && !aiMoveCSP()) {
            pickRandomCell();
            console.log("totally random")
        }
    }


}