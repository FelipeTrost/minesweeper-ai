const boardStates = { playing: 0, won: 1, lost: 2 };
Object.freeze(boardStates);

class Board {
  constructor(cols, rows, mineAmount) {
    this.cols = cols;
    this.rows = rows;
    this.mineAmount = mineAmount;
    this.minesLeft = mineAmount;
    this.revealedTiles = 0;
    this.ai = false;

    this.tiles = [];
    this.grid = new Array(cols);

    //Pupulate tiles
    for (let c = 0; c < cols; c++) {
      this.grid[c] = new Array(rows);

      for (let r = 0; r < rows; r++) {
        const tile = new Tile(c, r);
        this.tiles.push(tile);
        this.grid[c][r] = tile;
      }
    }

    //Choose random spots for bombs
    // This doesn't need to be efficient nor super complex, since, you know, we only do it once per game
    // But I wan't to implement a version of the fisher-yates shuffle

    let length = this.tiles.length;
    let virtualSwap = new Array(length);
    let index;
    for (let i = 0; i < bombsAmount; i++) {
      index = Math.round(Math.random() * length);

      //now we actually set the tile to a mine
      this.tiles[
        index in virtualSwap ? virtualSwap[index] : index
      ].isMine = true;

      // Since we can't permutate the original array, because..., i don't know, it wouldn't be pretty
      // We represent the swaps, by saving them in the virtualSwap array
      /// Since the elements that we "swap", to the back of the array will never be changed, we don't have to worry about that
      if (length - 1 in virtualSwap)
        virtualSwap[index] = virtualSwap[length - 1];
      else virtualSwap[index] = length - 1;

      length--; //shrink window
    }

    //Populate all cells with their neighbor mines amount
    for (const tile of this.tiles) {
      tile.populateNeighbors(this.grid);
      tile.calculateMinesNear();
    }

    this.boardState = boardStates.playing;
  }

  show() {
    background(255);
    textAlign(CENTER);
    for (const tile of this.tiles) tile.show();

    if (this.boardState === boardStates.playing) {
      bombsLeftDiv.innerText = `Bombs left: ${this.minesLeft}`;

      if (this.ai) {
        const gs = getDisjunctGroups(board);
        for (const g of gs) {
          for (const tile of g.tiles) tile.tempSpecialColor = [255, 0, 0];
          for (const tile of g.responsible)
            tile.tempSpecialColor = [0, 255, 255];
        }

        aiMove(this);
      }

      this.checkWin();
    } else {
      const status =
        this.boardState === boardStates.won ? "You won!!" : "You lost :(";

      push();
      textSize(52);
      textAlign(CENTER);
      fill(0);
      text(status, width / 2, height / 2);
      pop();
    }
  }

  colourTiles(args, reveal) {
    for (const tile of this.tiles) {
      // Reveal all mines with a green color
      tile.specialColor = args;
      if (reveal) tile.state = states.revealed;
    }
  }

  checkWin() {
    const unrevealed = this.cols * this.rows - this.revealedTiles;

    if (unrevealed !== bombsAmount) return false;

    this.colourTiles([230, 255, 230], true);

    this.boardState = boardStates.won;
    return true;
  }

  toTile(...args) {
    if (args.length === 1) return args[0];

    const [col, row] = args;
    return this.grid[col][row];
  }

  toId(tile) {
    return tile.col * this.cols + tile.row;
  }

  //If reveal is going to be on the board, we might as well do it for disable, in order to keep things consistent
  toggleDisable(...args) {
    if (this.boardState !== boardStates.playing) return;
    const tile = this.toTile(...args);

    const tileState = tile.toggleDisable();
    if (tileState == states.disabled) this.minesLeft -= 1;
  }

  reveal(...args) {
    if (this.boardState !== boardStates.playing) return;
    const tile = this.toTile(...args);

    const [success, tileState] = tile.reveal();

    if (!success) return; // meaning we didn't succesfully reveal the tile (its disabled or already has been revealed)

    // BOOOOM
    // The user revealed a mine
    if (tile.isMine) {
      this.boardState = boardStates.lost;
      tile.show();
      this.colourTiles([220, 100, 100]);
      return;
    }

    // If we get to here we disabled a tile
    this.revealedTiles += 1;

    if (tile.minesNear !== 0) return;

    //If the tile is a 0, we need to reveal the neighbors
    // I know, this is a very poor implementation of a queue, but it'll do
    let queueHead = { tile, next: null };
    let queueTale = queueHead;

    while (queueHead !== null) {
      const currentTile = queueHead.tile;

      for (const neighbor of currentTile.neighbors) {
        // I guess thi is how the game works, by just skipping disabled/revealed tiles
        // although I guess we would never get a revealed tile in this context
        if (neighbor.state !== states.none) continue;

        if (neighbor.minesNear === 0) {
          // add to queue
          queueTale.next = { tile: neighbor, next: null };
          queueTale = queueTale.next;
        }

        neighbor.reveal();
        this.revealedTiles++;
      }

      queueHead = queueHead.next;
    }

    return true;
  }
}
