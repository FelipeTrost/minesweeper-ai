function Cell(col, row) {
  // TODO: make this variable private
  this.mine = false;

  this.revealed = false;
  this.disabled = false;
  //refers to mines
  this.neighbors = 0;

  this.col = col;
  this.row = row;

  //Only for testing
  this.wall = false;

  this.show = function (background) {
    stroke(0);
    if (background) fill(...background);
    else if (this.wall) fill(...this.wall);
    else if (this.revealed) fill(220);
    else noFill();

    rect(this.row * cellWidth, this.col * cellWidth, cellWidth, cellWidth);

    if (this.disabled) {
      line(
        this.row * cellWidth,
        this.col * cellWidth,
        (this.row + 1) * cellWidth,
        (this.col + 1) * cellWidth
      );
    }

    if (this.mine && this.revealed)
      circle(
        this.row * cellWidth + cellWidth / 2,
        this.col * cellWidth + cellWidth / 2,
        cellWidth / 2
      );

    if (!this.mine && this.revealed && this.neighbors > 0)
      text(
        this.neighbors,
        this.row * cellWidth + cellWidth / 2,
        this.col * cellWidth + cellWidth / 2
      );
  };

  this.populateNeighbors = (gridInput) => {
    let total = 0;
    this.callOnNeighbors((cell) => {
      if (cell.mine) total++;
    }, gridInput);
    this.neighbors = total;
  };

  this.disable = (force = false) =>
    (this.disabled = force || (!this.disabled && !this.revealed));

  this.getNeighborStatus = () => {
    let disabled = 0;
    let revealed = 0;
    let notRevealed = 0;
    this.callOnNeighbors((n) => {
      if (n.disabled) disabled++;
      else if (n.revealed) revealed++;
      else notRevealed++;
    }, grid);
    return {
      disabled,
      revealed,
      notRevealed,
      total: disabled + revealed + notRevealed,
    };
  };

  this.reveal = (recursive = true) => {
    if (this.disabled || this.revealed) {
      return false;
    }

    if (this.mine) {
      //return 'mine' to let the programm know that theive hit a mine
      return "mine";
    }

    this.revealed = true;

    if (!this.mine && this.neighbors == 0 && recursive)
      this.callOnNeighbors((cell) => {
        if (!cell.mine) {
          cell.reveal();
        }
      }, grid);

    return true;
  };

  this.callOnNeighbors = (func, gridInput) => {
    const row = this.row;
    const col = this.col;

    if (row - 1 >= 0) func(gridInput[col][row - 1]);

    if (row + 1 < rows) func(gridInput[col][row + 1]);

    if (col - 1 >= 0) func(gridInput[col - 1][row]);

    if (col + 1 < cols) func(gridInput[col + 1][row]);

    //Diagonals
    if (col + 1 < cols && row + 1 < rows) func(gridInput[col + 1][row + 1]);

    if (col + 1 < cols && row - 1 >= 0) func(gridInput[col + 1][row - 1]);

    if (col - 1 >= 0 && row + 1 < rows) func(gridInput[col - 1][row + 1]);

    if (col - 1 >= 0 && row - 1 >= 0) func(gridInput[col - 1][row - 1]);
  };
}
