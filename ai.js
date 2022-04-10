function aiMove(board) {
  if (singlePoint(board)) return "singlePoint";

  if (startBacktracking(board)) return "backtracking";

  // If we get to here we'rej just going to have to reveal a random tile
  pickRandomCell(board);
  return "random";
}

// SINGLE POINT APPROACH
// This is a simple and very straight forward approach, we just go cell to cell
function singlePoint(board) {
  let didSomething = false;

  for (const tile of board.tiles) {
    if (singlePointUtil(board, tile)) didSomething = true;
  }

  return didSomething;
}

function singlePointUtil(board, tile) {
  //skip cell if it is already revealed or disabled
  const state = tile.state;
  if (
    state !== states.revealed ||
    (state === states.revealed && !tile.minesNear)
  )
    return false;

  let minesLeft = tile.minesNear;
  let unknownTiles = [];

  for (const neighbor of tile.neighbors) {
    if (neighbor.state === states.disabled) minesLeft--;
    else if (neighbor.state === states.none) unknownTiles.push(neighbor);
  }

  let didSomething = false;

  if (minesLeft !== 0 && minesLeft === unknownTiles.length) {
    unknownTiles.forEach((neighbor) => board.toggleDisable(neighbor));
    didSomething = true;
  }

  if (minesLeft === 0 && unknownTiles.length !== 0) {
    unknownTiles.forEach((neighbor) => board.reveal(neighbor));
    didSomething = true;
  }

  return didSomething;
}

// CSP / BACKTRACKING APPROACH
// Here we check all disjunct groups and do the backtracking approach
// the configuration array says wether a tile is or isn't a mine

const BACKTRACKING_CUTOFF = 20; //So that we don't do massive trees

function startBacktracking(board) {
  // TODO: we don't necessarely need to compute this every time
  const groups = getDisjunctGroups(board);

  // for (const group of groups) {
  //   const configuration = Array(group.tiles.length);
  //   backtracking(group, configuration, 0);
  // }

  //We could do backtracking on each group, but that would take to long
  // I think it's best we just do one group at a time
  // for now i'll just take the smallest one

  // Maybe sorting the whole array isn't such a good idea, but i'm not expecting big arrays
  const sorted = groups
    .filter(
      (group) =>
        group.tiles.length <= BACKTRACKING_CUTOFF && group.tiles.length > 3
    )
    .sort((a, b) => -(a.tiles.length - b.tiles.length));

  for (const targetGroup of sorted) {
    const configuration = Array(targetGroup.tiles.length).fill(0);

    if (!backtracking(board, targetGroup, configuration)) continue;

    // If we found a valid configuration we use it
    for (let i = 0; i < targetGroup.tiles.length; i++) {
      const tile = targetGroup.tiles[i];

      if (!configuration[i]) {
        board.reveal(tile);
      } else {
        board.toggleDisable(tile);
      }
    }

    return true;
  }

  return false;
}

function backtracking(board, group, configuration, index = 0) {
  const configurationBombs = configuration.reduce((a, b) => a + b);

  if (index >= configuration.length || configurationBombs >= board.minesLeft) {
    return checkConfiguration(group, configuration);
  }

  //put 0 in index position
  configuration[index] = 0;
  if (backtracking(board, group, configuration, index + 1)) return true;

  //if none of the combinations that follow work, we try 1
  configuration[index] = 1;
  return backtracking(board, group, configuration, index + 1);
}

function checkConfiguration({ tiles, responsible }, configuration) {
  //TODO: Massive improvements needed here (that i didn't do because I want to structure my commits, I know...)
  // Basically we check that every cell in the group has exactly as many bombs near it as it should
  const tileMap = new Map();
  for (const i in tiles) tileMap.set(tiles[i], i);

  for (const tile of responsible) {
    let minesLeft = tile.minesNear;

    for (const neighbor of tile.neighbors) {
      if (tileMap.has(neighbor))
        minesLeft -= configuration[tileMap.get(neighbor)];
      else if (neighbor.disabled) minesLeft -= 1;
    }

    if (minesLeft != 0) return false;
  }

  return true;
}

function getDisjunctGroups(boardInstance) {
  const union = new UnionFind(boardInstance);

  for (const tile of boardInstance.tiles) {
    if (tile.state === states.revealed && tile.minesNear !== 0) {
      for (const neighbor of tile.neighbors) {
        if (neighbor.state == states.none) {
          union.join(neighbor, tile);
        }
      }
    }
  }

  return union.getGroups();
}

// RANDOM SECTION
// this is what we do when we don't know what to do
function pickRandomCell(board) {
  const corners = [
    board.toTile(0, 0),
    board.toTile(0, board.rows - 1),
    board.toTile(board.cols - 1, 0),
    board.toTile(board.cols - 1, board.cols - 1),
  ];

  for (const corner of corners) {
    if (corner.state === states.none) {
      board.reveal(corner);
      return;
    }
  }

  const openTiles = board.tiles.filter((tile) => tile.state === states.none);
  const randomIndex = Math.floor(Math.random() * openTiles.length);
  board.reveal(openTiles[randomIndex]);
}
