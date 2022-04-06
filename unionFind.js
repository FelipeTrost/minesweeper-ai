class UnionFind {
  constructor(board, c, r) {
    this.board = board;
    this.cols = c;
    this.rows = r;

    // So that if there are more rows than cols we don't get overlapping id's
    this.dominatingMultiplicator = Math.max(c, r);

    this.tileAmount = this.cols * this.rows;
    this.responsible = Array(this.tileAmount);
    this.parent = Array(this.tileAmount)
      .fill()
      .map((_, i) => i);
  }

  toIdentifier(tile) {
    const row = tile.row;
    const col = tile.col;

    return row + col * this.dominatingMultiplicator;
  }

  toTile(indentifier) {
    let col = Math.floor(indentifier / this.dominatingMultiplicator);
    let row = indentifier - col * this.dominatingMultiplicator;

    return this.board[col][row];
  }

  find(indentifier) {
    // let indentifier = this.toIdentifier(tile);

    while (this.parent[indentifier] != indentifier) {
      //If you're not your own father, you're not the root
      //so we set our parent as our grandfather
      const grandpa = this.parent[this.parent[indentifier]];

      this.parent[indentifier] = grandpa;
      indentifier = grandpa;
    }

    return indentifier;
  }

  // responsible cell is the cell that contains the info for the tiles, the other one is unrevealed
  join(tile, responsibleTile) {
    const id = this.find(this.toIdentifier(tile));
    const idResp = this.find(this.toIdentifier(responsibleTile));

    this.responsible[idResp] = true;

    this.parent[id] = idResp;
  }

  getGroups() {
    const map = {};

    for (let id = 0; id < this.tileAmount; id++) {
      const parent = this.find(id);
      const tile = this.toTile(id);

      if (!map[parent]) map[parent] = { tiles: [], responsible: [] };

      if (this.responsible[id]) map[parent].responsible.push(tile);
      else map[parent].tiles.push(tile);
    }

    // Store groups in case we need them for later
    this.groups = Object.keys(map).map((key) => map[key]);

    // Filter out single element groups
    this.groups = this.groups.filter(
      (group) => group.tiles.length != 1 && group.responsible.length != 1
    );
    // console.log(this.groups);

    return this.groups;
  }
}
