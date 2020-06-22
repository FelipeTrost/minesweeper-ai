// ---- AI ----
function aiMove() {

    //start the algorith
    let choice = false

    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            let cell = grid[c][r];

            //skip cell if isnt revealed
            if (!cell.revealed)
                continue;

            let status = cell.getNeighborStatus()

            // Basic disableing
            if (status.notRevealed == (cell.neighbors - status.disabled))
                cell.callOnNeighbors(n => {
                    if (!n.revealed && !n.disabled) {
                        n.disable(true)
                        choice = true
                    }
                }, grid)

            status = cell.getNeighborStatus()
            if (status.disabled === cell.neighbors && cell.revealed != cell.total - cell.neighbor)
                cell.callOnNeighbors(n => {
                    if (!n.disbled && !n.revealed) {
                        if (callReveal(n.col, n.row))
                            choice = true
                    }
                }, grid)
        }
    }

    return choice;
}

//Find edges
function startEdgeFinding(cell, track) {
    for (let i = 0; i < track.length; i++) {
        if (cellinList(cell, track[i]) !== false)
            return []
    }

    return edgeFinding(cell)
}
//recursive function tu go through edges
function edgeFinding(cell, track = []) {
    if (cell.revealed || cell.disabled || cellinList(cell, track))
        return track

    let isOnBorder = false
    cell.callOnNeighbors(n => {
        if (n.revealed || n.disabled)
            isOnBorder = true
    }, grid)

    if (!isOnBorder)
        return track

    track = [...track, cell]

    cell.callOnNeighbors(neighbor => {
        track = edgeFinding(neighbor, track)
    }, grid)

    return track
}

//async to let the timer run
function aiMoveCSP() {
    console.log("advanced algorithd")

    //Get cells that arent open nor disabled and check which ones are in the border
    let borders = []
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            let result = startEdgeFinding(grid[c][r], borders)

            if (result.length !== 0)
                borders.push(result.map(cell => new Cell(
                    cell.col, cell.row
                )))
        }
    }

    //If walls are longer than 20 cells it takes to long to process
    //we need to break them up, for now im just dividing them into equal sizes
    //but i cant just cut them off, because them the algorith wouldnt know there is another option for mine
    //this is why we need to remove these cells

    //here i store the cells that are being left out
    leftOut = []
    borders = borders.reduce((a, border) => {
        const fits20 = Math.ceil(border.length / 22)
        if (fits20 > 1) {
            const amountPerArray = Math.ceil(border.length / fits20)
            console.log("splitting", fits20, amountPerArray, border.length)
            let result = []

            for (let i = 0; i < fits20; i++) {
                let segment = []

                for (let x = 0; x < amountPerArray; x++) {
                    const element = border[i * amountPerArray + x];
                    if (!element)
                        break


                    segment = [...segment, element]
                }
                result[i] = segment
            }

            return [...a, ...result]
        }

        return [...a, border]
    }, [])

    // console.log("borders found:", borders.length)

    if (!borders.length)
        return false

    let madeChoice = false
    for (let x = 0; x < borders.length; x++) {
        // console.log("working on border of the size", borders[x].length)

        //Get cells otside of the border to check scenario
        let outside = []
        for (let i = 0; i < borders[x].length; i++) {
            const cell = borders[x][i];

            cell.callOnNeighbors(neighbor => {
                let availableBombs = neighbor.neighbors - neighbor.getNeighborStatus().disabled
                if (cellinList(neighbor, leftOut))
                    availableBombs = availableBombs - 1

                if (neighbor.revealed && availableBombs > 0) {
                    const newCell = new Cell(
                        neighbor.col,
                        neighbor.row
                    )
                    newCell.neighbors = availableBombs
                    outside.push(newCell)
                }
            }, grid)
        }

        //Check all possible combinatios and check if they agree with the constraints
        let validCombinations = []
        for (let i = 0; i < 2 ** borders[x].length; i++) {
            //get 'binary' string
            let bString = (i).toString(2);
            bString = "0".repeat(borders[x].length - bString.length) + bString


            //set cells to the given combination
            for (let l = 0; l < bString.length; l++) {
                borders[x][l].mine = bString[l] == "1"
            }

            //fake grid, just for making population easier
            const fakeGrid = Array(cols)
            for (let i = 0; i < cols; i++) {
                fakeGrid[i] = Array(rows)
            }
            borders[x].forEach(cell => {
                fakeGrid[cell.col][cell.row] = cell
            });

            //check if scenario is valid according to rules
            let checksOut = true;
            outside.forEach(cell => {
                let mines = 0
                cell.callOnNeighbors(neighbor => {
                    if (neighbor && neighbor.mine)
                        mines++;
                }, fakeGrid)

                if (mines !== cell.neighbors)
                    checksOut = false;
            })

            if (checksOut)
                validCombinations.push(i)
        }

        //if there are valid combinations run this
        if (validCombinations.length !== 0) {

            let mines = validCombinations.reduce((acc, v) => v & acc)
            let freSpaces = validCombinations.reduce((acc, v) => v | acc)

            let minesString = mines.toString(2);
            minesString = "0".repeat(borders[x].length - minesString.length) + minesString

            let freSpacesString = freSpaces.toString(2);
            freSpacesString = "0".repeat(borders[x].length - freSpacesString.length) + freSpacesString

            //This is if we are certain of a fields state
            if (mines > 0) {
                madeChoice = true
                for (let i = 0; i < borders[x].length; i++) {
                    const cell = borders[x][i];

                    if (minesString[i] === '1')
                        grid[cell.col][cell.row].disable()

                    // if (freSpacesString[i] === '0')
                    //     callReveal(cell.col, cell.row)
                }

                //Here we just have to take a chance and check if a cell appears often as empty
            }
            else {
                let register = []
                for (let i = 0; i < validCombinations.length; i++) {

                    let combString = validCombinations[i].toString(2);
                    combString = "0".repeat(borders[x].length - combString.length) + combString

                    for (let z = 0; z < combString.length; z++) {
                        const bit = combString[z];
                        if (bit === "1")
                            continue

                        if (register[z])
                            register[z] += 1
                        else
                            register[z] = 1
                    }

                }
                let ocurrIndex = 0
                for (let i = 0; i < borders[x].length; i++) {
                    if (register[i] > register[ocurrIndex])
                        ocurrIndex = i
                }

                if (register.reduce((v, acc) => acc + (register[ocurrIndex] == v), 0) > Math.ceil(borders[x].length / 4)) {
                    continue;
                }

                console.log("taking a chance");

                const cell = borders[x][ocurrIndex]
                callReveal(cell.col, cell.row);

                //if we take a chance we better just stop it know and see what happens
                return true;
            }

        }
    }

    return madeChoice;
}

function pickRandomCell() {
    let openSpots = []
    for (let i = 0; i < grid.length; i++) {
        for (let z = 0; z < grid[i].length; z++) {
            const cell = grid[i][z];
            if (!cell.disabled && !cell.revealed)
                openSpots = [...openSpots, cell]
        }
    }

    const pick = openSpots[Math.floor(Math.random() * openSpots.length)];
    if (pick)
        callReveal(pick.col, pick.row)
}