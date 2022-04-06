const rows = 16;
const cols = 16;

// const bombsAmount = Math.floor(rows * cols * 0.2);
const bombsAmount = 40;

let grid;
let cellWidth = 30;

let gameOver = true;
let win;
let aiOn = false;

let timeBeginning;

//buttons
let restartB, toggleAI;

//display divs
let displayDiv;
let bombsLeftDiv = document.querySelector("#bombCount");

function mousePressed() {
  const col = Math.floor(mouseY / (height / cols));
  const row = Math.floor(mouseX / (width / rows));

  if (col > cols - 1 || row > rows - 1 || col < 0 || row < 0) return false;

  if (mouseButton === RIGHT) grid[col][row].disable();
  else callReveal(col, row);
}

function callReveal(c, r) {
  let result = grid[c][r].reveal();

  if (result == "mine") {
    grid[c][r].wall = [255, 255, 0];
    grid[c][r].show();

    grid[c][r].wall = [255, 100, 100];
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        grid[c][r].revealed = true;
      }
    }

    win = false;
    gameOver = true;
  }
  return result;
}

function checkWin() {
  let unRevealed = 0;

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const cell = grid[c][r];
      unRevealed += !cell.revealed;
    }
  }

  if (unRevealed == bombsAmount) {
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        grid[c][r].wall = [230, 255, 230];
        grid[c][r].revealed = true;
      }
    }

    win = true;
    gameOver = true;
  }
}

//Separate function to set up canvas, for the reset button
function start() {
  gameOver = false;

  //populates global grid variable with grid
  getGrid();

  // timeBeginning = new Date();
  loop();
}

function setup() {
  let canvas = createCanvas(rows * cellWidth, cols * cellWidth);
  canvas.parent("canvas");

  frameRate(10);

  //Restart button
  restartB = createButton("Restart");
  restartB.mousePressed(start);

  //AI button
  toggleAI = createButton(aiOn ? "Turn AI Off" : "Turn AI On");
  toggleAI.mousePressed(() => {
    aiOn = !aiOn;
    toggleAI.html(aiOn ? "Turn AI Off" : "Turn AI On");
  });

  //divs
  // displayDiv = createDiv("0");

  start();
}

function draw() {
  background(255);

  //show all cells
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      grid[c][r].show();
    }
  }

  if (!gameOver) {
    //update divs
    // bombsLeftDiv.html(`Bombs left: ${bombsAmount - disabledFields()}`);
    // displayDiv.html(
    //   "Time: " + Math.floor((new Date() - timeBeginning) / 100) / 10
    // );
    bombsLeftDiv.innerText = `Bombs left: ${bombsAmount - disabledFields()}`;

    const gs = getDisjunctGroups();
    // console.log(gs);
    for (const g of gs) {
      for (tile of g.tiles) tile.show([255, 0, 0]);
      for (tile of g.responsible) tile.show([0, 255, 255]);
    }

    //Run AI
    if (aiOn) console.log(aiMove());

    checkWin();
  } else {
    noLoop();
    if (!win && aiOn) alert("not every ai is perfect :(");
    else if (!win) alert("Booom");
    else alert("You won");
  }
}
