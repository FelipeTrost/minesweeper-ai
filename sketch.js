const rows = 16;
const cols = 16;

// const bombsAmount = Math.floor(rows * cols * 0.2);
const bombsAmount = 40;

let cellWidth = 30;

//buttons
let restartB, toggleAI;

//display divs
let displayDiv;
let bombsLeftDiv = document.querySelector("#bombCount");

let board = new Board(cols, rows, bombsAmount);

function mousePressed() {
  const col = Math.floor(mouseY / (height / cols));
  const row = Math.floor(mouseX / (width / rows));

  // Out of bounds
  if (col > cols - 1 || row > rows - 1 || col < 0 || row < 0) return false;

  if (mouseButton === RIGHT) board.toggleDisable(col, row);
  else board.reveal(col, row);
}

function setup() {
  let canvas = createCanvas(rows * cellWidth, cols * cellWidth);
  canvas.parent("canvas");

  frameRate(10);

  //Restart button
  const restartB = createButton("Restart");
  restartB.mousePressed(() => (board = new Board(cols, rows, bombsAmount)));

  //AI buttons
  const toggleAI = createButton("Toggle ai");
  toggleAI.mousePressed(() => (board.ai = !board.ai));

  const aiStep = createButton("Ai step");
  aiStep.mousePressed(() => aiMove(board));
}

function draw() {
  board.show();
}
