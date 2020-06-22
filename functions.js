function getGrid() {
    //Generate 2d grid
    grid = Array(cols)
    for (let i = 0; i < cols; i++) {
        grid[i] = Array(rows)
    }

    //populate grid with cells and also populate spots
    const spots = []
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            grid[c][r] = new Cell(c, r);
            spots.push([c, r])
        }
    }

    //Choose random spots for bombs
    for (let i = 0; i < bombsAmount; i++) {
        const index = Math.round(Math.random() * (spots.length - 1))
        const c = spots.splice(index, 1)[0]

        grid[c[0]][c[1]].mine = true;
    }

    //Populate all cells with their neighbor mines amount
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            grid[c][r].populateNeighbors(grid);
        }
    }
}

function disabledFields() {
    let total = 0;
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            if (grid[c][r].disabled)
                total++
        }
    }
    return total
}

function revealedFields() {
    let total = 0;
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            if (grid[c][r].revealed)
                total++
        }
    }
    return total
}

//checks if cell is in list, only checks position
function cellinList(cell, list) {
    for (let i = 0; i < list.length; i++) {
        const cellL = list[i];
        if (cellL.row == cell.row && cellL.col == cell.col)
            return true
    }
    return false
}

//checks number of neighbors per cell in two grids
//grid 2 should be the new to compare grid
function compareGrids(grid1, grid2, opens) {
    console.log(opens)
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {

            let found = false
            opens.forEach(cel => {
                if (cel.row == r && cel.col == c)
                    found = true
            });
            if (found)
                continue

            if (grid1[c][r].neighbors != grid2[c][r].neighbors)
                return false
        }
    }
    return true;
}