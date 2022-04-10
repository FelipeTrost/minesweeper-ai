const states = { none: 0, revealed: 1, disabled: 2 };
Object.freeze(states);
class Tile {
  state = states.none;
  neighbors = [];
  minesNear = 0;
  specialColor = null;
  tempSpecialColor = null;

  isMine = false;

  constructor(col, row) {
    this.col = col;
    this.row = row;
  }
  // TODO: make this variable private

  show() {
    stroke(0);

    if (this.tempSpecialColor) fill(...this.tempSpecialColor);
    if (this.specialColor) fill(...this.specialColor);
    else if (this.state === states.revealed) fill(220);
    else noFill();
    this.tempSpecialColor = null; //Specialcolours are not persistent

    const startX = this.row * cellWidth;
    const startY = this.col * cellWidth;

    rect(startX, startY, cellWidth, cellWidth);

    switch (this.state) {
      case states.disabled:
        line(startX, startY, startX + cellWidth, startY + cellWidth);
        break;

      case states.revealed:
        const centerX = this.row * cellWidth + cellWidth / 2;
        const centerY = this.col * cellWidth + cellWidth / 2;

        if (this.isMine) circle(centerX, centerY, cellWidth / 2);
        else text(this.minesNear, centerX, centerY);

        break;

      default:
        break;
    }
  }

  populateNeighbors(board) {
    const row = this.row;
    const col = this.col;

    if (row - 1 >= 0) this.neighbors.push(board[col][row - 1]);
    if (row + 1 < rows) this.neighbors.push(board[col][row + 1]);
    if (col - 1 >= 0) this.neighbors.push(board[col - 1][row]);
    if (col + 1 < cols) this.neighbors.push(board[col + 1][row]);

    //Diagonals
    if (col + 1 < cols && row + 1 < rows)
      this.neighbors.push(board[col + 1][row + 1]);
    if (col + 1 < cols && row - 1 >= 0)
      this.neighbors.push(board[col + 1][row - 1]);
    if (col - 1 >= 0 && row + 1 < rows)
      this.neighbors.push(board[col - 1][row + 1]);
    if (col - 1 >= 0 && row - 1 >= 0)
      this.neighbors.push(board[col - 1][row - 1]);
  }

  calculateMinesNear() {
    if (this.isMine) return; //If we're a bomb we don't care
    for (const tile of this.neighbors) {
      this.minesNear += tile.isMine;
    }
  }

  toggleDisable() {
    // let success = false;

    switch (this.state) {
      case states.none:
        this.state = states.disabled;
        break;
      case states.disabled:
        this.state = states.none;
        break;
      default:
        break;
    }

    return this.state;
  }

  reveal() {
    let success = false;

    if (this.state == states.none) {
      this.state = states.revealed;
      success = true;
    }

    return [success, this.state];
  }
}
