const rows = 16;
const cols = 16;

// const bombsAmount = Math.floor(rows * cols * 0.2);
const bombsAmount = 40;

let cellWidth = 30;

//display divs
let displayDiv;
const bombsLeftDiv = document.querySelector("#bombCount");
const restartB = document.querySelector("#restart");
const toggleAI = document.querySelector("#toggleAi");
const aiStep = document.querySelector("#aiStep");

restartB.addEventListener(
  "click",
  () => (board = new Board(cols, rows, bombsAmount))
);
toggleAI.addEventListener("click", () => (board.ai = !board.ai));
aiStep.addEventListener("click", () => aiMove(board));

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
}

function draw() {
  board.show();
}
