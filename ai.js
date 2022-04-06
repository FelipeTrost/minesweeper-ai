function aiMove() {
  if (singlePoint()) return "singlePoint";

  if (startBacktracking()) return "backtracking";

  // If we get to here we'rej just going to have to reveal a random tile
  pickRandomCell();
  return "random";
}

// SINGLE POINT APPROACH
// This is a simple and very straight forward approach, we just go cell to cell
function singlePoint() {
  let didSomething = false;

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      if (singlePointUtil(grid[c][r])) didSomething = true;
    }
  }

  return didSomething;
}

function singlePointUtil(cell) {
  //skip cell if it is already revealed or disabled
  if (!cell.revealed || cell.disabled || cell.neighbors === 0) return false;

  let minesLeft = cell.neighbors;
  let unknownCells = [];

  cell.callOnNeighbors((neighborCell) => {
    if (neighborCell.disabled) minesLeft--;
    else if (!neighborCell.revealed) unknownCells.push(neighborCell);
  }, grid);

  let didSomething = false;

  if (minesLeft !== 0 && minesLeft == unknownCells.length) {
    unknownCells.forEach((c) => c.disable(true));
    didSomething = true;
  }

  if (minesLeft == 0 && unknownCells.length !== 0) {
    unknownCells.forEach((c) => callReveal(c.col, c.row));
    didSomething = true;
  }

  return didSomething;
}

// CSP / BACKTRACKING APPROACH
// Here we check all disjunct groups and do the backtracking approach
// the configuration array says wether a tile is or isn't a mine

const BACKTRACKING_CUTOFF = 20; //So that we don't do massive trees

function startBacktracking() {
  // TODO: we don't necessarely need to compute this every time
  const groups = getDisjunctGroups();

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

    // If we found a valid configuration we use it
    if (backtracking(targetGroup, configuration)) {
      for (const i in targetGroup.tiles) {
        const tile = targetGroup.tiles[i];

        if (!configuration[i]) {
          callReveal(tile.col, tile.row);
        } else {
          tile.disable(true);
        }
      }

      return true;
    }
  }

  return false;
}

function backtracking(group, configuration, index = 0) {
  const bombsLeft = bombsAmount - disabledFields();
  const configurationBombs = configuration.reduce((a, b) => a + b);

  if (index >= configuration.length || configurationBombs >= bombsLeft) {
    return checkConfiguration(group, configuration);
  }

  //put 0 in index position
  configuration[index] = 0;
  if (backtracking(group, configuration, index + 1)) return true;

  //if none of the combinations that follow work, we try 1
  configuration[index] = 1;
  return backtracking(group, configuration, index + 1);
}

function checkConfiguration({ tiles, responsible }, configuration) {
  //TODO: Massive improvements needed here (that i didn't do because I want to structure my commits, I know...)
  // Basically we check that every cell in the group has exactly as many bombs near it as it should
  const tileMap = new Map();
  for (const i in tiles) tileMap.set(tiles[i], i);

  for (const tile of responsible) {
    let minesLeft = tile.neighbors;

    tile.callOnNeighbors((neighbor) => {
      if (tileMap.has(neighbor))
        minesLeft -= configuration[tileMap.get(neighbor)];
      else if (neighbor.disabled) minesLeft -= 1;
    }, grid);

    if (minesLeft != 0) return false;
  }

  return true;
}

function getDisjunctGroups() {
  const union = new UnionFind(grid, cols, rows);

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const cell = grid[c][r];

      if (cell.revealed && cell.neighbors != 0) {
        cell.callOnNeighbors((neighbor) => {
          if (!neighbor.revealed && !neighbor.disabled) {
            union.join(neighbor, cell, true);
          }
        }, grid);
      }
    }
  }

  return union.getGroups();
}

// RANDOM SECTION
// this is what we do when we don't know what to do
function pickRandomCell() {
  let openSpots = [];
  for (let i = 0; i < grid.length; i++) {
    for (let z = 0; z < grid[i].length; z++) {
      const cell = grid[i][z];
      if (!cell.disabled && !cell.revealed) openSpots = [...openSpots, cell];
    }
  }

  const pick = openSpots[Math.floor(Math.random() * openSpots.length)];
  if (pick) callReveal(pick.col, pick.row);
}
