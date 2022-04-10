class UnionFind {
  constructor(board) {
    this.board = board;

    const tileAmount = this.board.cols * this.board.rows;
    this.responsible = Array(tileAmount);
    this.parent = Array(tileAmount)
      .fill()
      .map((_, i) => i);
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
    const tileParent = this.find(this.board.toId(tile));
    const respParent = this.find(this.board.toId(responsibleTile));

    this.responsible[respParent] = true;
    this.parent[tileParent] = respParent;
  }

  getGroups() {
    const map = new Map();

    for (let id = 0; id < this.board.tiles.length; id++) {
      const parent = this.find(id);
      const tile = this.board.tiles[id];

      let info;
      if (!map.has(parent)) {
        info = { tiles: [], responsible: [] };
        map.set(parent, info);
      } else {
        info = map.get(parent);
      }

      if (this.responsible[id]) info.responsible.push(tile);
      else info.tiles.push(tile);
    }

    // Store groups in case we need them for later
    this.groups = [];

    for (const group of map.values()) {
      if (group.tiles.length != 1 && group.responsible.length != 1)
        this.groups.push(group);
    }

    return this.groups;
  }
}
