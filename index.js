/**
 * 
 * 0 [0, 0]
 * 1 [0, 3]
 * 2 [0, 6]
 * 3 [3, 0]
 * 4 [3, 3]
 * 5 [3, 6]
 * 6 [6, 0]
 * 7 [6, 3]
 * 8 [6, 6]
 */

const SUDOKU_SIZE = 9
const SUDOKU_SUBGRID_SIZE = 9
const EMPTY_CELL = 0
const VALID_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

const originalValues = new Map()
let solution = []

function getCoordinateAsString(rowPos, colPos) {
    return `${colPos},${rowPos}`
}

function getGridIndexFromCoordinate(rowPos, colPos) {
    const row = Math.floor(rowPos / SUDOKU_SUBGRID_SIZE)
    const column = Math.floor(colPos / SUDOKU_SUBGRID_SIZE)

    return row * SUDOKU_SUBGRID_SIZE + column
}

function getRowColFromGridIndex(gridIndex) {
    const row = Math.floor(gridIndex / SUDOKU_SUBGRID_SIZE) * SUDOKU_SUBGRID_SIZE
    const column = (gridIndex % SUDOKU_SUBGRID_SIZE) * SUDOKU_SUBGRID_SIZE

    return [row, column]
}

function getCoordinateFromPosition(position) {
    const row = Math.floor(position / SUDOKU_SIZE)
    const column = position % SUDOKU_SIZE

    return [row, column]
}

function checkColValidity(gridIndex, sudokuPuzzle) {
    const [, c] = getRowColFromGridIndex(gridIndex)

    const col = sudokuPuzzle.map((row) => row[c])

    const checked = new Map()

    for (let i = 0; i < col.length; i++) {
        const value = col[i]

        if (value === EMPTY_CELL) {
            continue
        }

        // if (!VALID_NUMBERS.includes(value)) {
        //     return false
        // }

        if (checked.has(value)) {
            return false
        }

        checked.set(value, true)
    }

    return true
}

function checkRowValidity(gridIndex, sudokuPuzzle) {
    const [r] = getRowColFromGridIndex(gridIndex)

    const row = sudokuPuzzle[r]

    const checked = new Map()

    for (let i = 0; i < row.length; i++) {
        const value = row[i]

        if (value === EMPTY_CELL) {
            continue
        }

        // if (!VALID_NUMBERS.includes(value)) {
        //     return false
        // }

        if (checked.has(value)) {
            return false
        }

        checked.set(value, true)
    }

    return true
}

// return false if have duplicates, true otherwise
function checkSubGridValidity(gridIndex, sudokuPuzzle) {
    const [row, col] = getRowColFromGridIndex(gridIndex)

    const checked = new Map()

    for (let x = col; x < col + SUDOKU_SUBGRID_SIZE; x++) {
        for (let y = row; y < row + SUDOKU_SUBGRID_SIZE; y++) {
            const value = sudokuPuzzle[y][x]

            if (value === EMPTY_CELL) {
                continue
            }

            // if (!VALID_NUMBERS.includes(value)) {
            //     return false
            // }

            if (checked.has(value)) {
                return false
            }

            checked.set(value, true)
        }
    }

    return true
}

function checkCellValidity(rowPos, colPos, sudokuPuzzle) {
    if (sudokuPuzzle[rowPos][colPos] === EMPTY_CELL) {
        return true
    }

    const coordinateAsString = getCoordinateAsString(rowPos, colPos)
    if (originalValues.has(coordinateAsString)) {
        return true
    }

    const gridIndex = getGridIndexFromCoordinate(rowPos, colPos)

    const colIsValid = checkColValidity(gridIndex, sudokuPuzzle)
    if (!colIsValid) {
        return false
    }

    const rowIsValid = checkRowValidity(gridIndex, sudokuPuzzle)
    if (!rowIsValid) {
        return false
    }

    const gridIsValid = checkSubGridValidity(gridIndex, sudokuPuzzle)
    if (!gridIsValid) {
        return false
    }

    return true
}

function backtrack(position, cellsPlaced, numOfCellsToPlace, sudokuPuzzle) {
    if (cellsPlaced === numOfCellsToPlace) {
        solution = sudokuPuzzle.map((row) => [...row])
        return
    }

    const [row, col] = getCoordinateFromPosition(position)

    for (const number of VALID_NUMBERS) {
        const coordinateAsString = getCoordinateAsString(row, col)

        // don't modify original values
        if (originalValues.has(coordinateAsString)) {
            backtrack(position + 1, cellsPlaced + 1, numOfCellsToPlace, sudokuPuzzle.map((row) => [...row]))
            return
        }

        sudokuPuzzle[row][col] = number

        const cellIsValid = checkCellValidity(row, col, sudokuPuzzle.map((row) => [...row]))
        if (cellIsValid) {
            backtrack(position + 1, cellsPlaced + 1, numOfCellsToPlace, sudokuPuzzle.map((row) => [...row]))
        }

        sudokuPuzzle[row][col] = EMPTY_CELL
    }
}

async function getSudokuPuzzle(filepath) {
    const file = Bun.file(filepath)

    const text = await file.text()
    
    const sudokuPuzzle = await JSON.parse(text)
    
    return sudokuPuzzle
}

function validateSudokuPuzzle(sudokuPuzzle) {
    if (sudokuPuzzle.length !== SUDOKU_SIZE) {
        return "A sudoku puzzle must have 9 rows"
    }

    for (let i = 0; i < sudokuPuzzle.length; i++) {
        const row = sudokuPuzzle[i]

        if (row.length !== SUDOKU_SIZE) {
            return "Each sudoku row must have 9 columns"
        }

        for (let j = 0; j < row.length; j++) {
            const value = row[j]

            if (!VALID_NUMBERS.includes(value) && value !== 0) {
                return "Each cell value in sudoku puzzle must be between 0 to 9. 0 represents empty cells."
            }

            const coordinateAsString = getCoordinateAsString(i, j)

            if (value !== 0) {
                originalValues.set(coordinateAsString, value)
            }
        }
    }

    return ""
}

function parseSudokuAsString(sudokuGrid) {
    let string = ""

    for (const row of sudokuGrid) {
        const rowAsString = row.join(" ")
        string += rowAsString
        string += "\n"
    }

    return string
}

const FILEPATH = "./sudoku.txt"

const sudokuPuzzle = await getSudokuPuzzle(FILEPATH)

const sudokuPuzzleIsInvalid = validateSudokuPuzzle(sudokuPuzzle)

if (sudokuPuzzleIsInvalid) {
    console.log(sudokuPuzzleIsInvalid)
} else {
    const startPosition = 0
    const numOfCellsPlaced = 0
    const numOfCellsToPlace = (SUDOKU_SIZE * SUDOKU_SIZE) - originalValues.size
    backtrack(startPosition, numOfCellsPlaced, numOfCellsToPlace, sudokuPuzzle)

    console.log("Solution\n")
    console.log(parseSudokuAsString(solution))
}