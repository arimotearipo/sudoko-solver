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
const SUDOKU_SUBGRID_SIZE = 3
const EMPTY_CELL = 0
const VALID_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

const originalValues = new Map()
let solution = []

// returns the index of the 3 by 3 subgrid where the coordinate belongs to.
function getGridIndexFromCoordinate(rowPos, colPos) {
    const row = Math.floor(rowPos / SUDOKU_SUBGRID_SIZE)
    const column = Math.floor(colPos / SUDOKU_SUBGRID_SIZE)

    return row * SUDOKU_SUBGRID_SIZE + column
}

function getCoordinateAsString(rowPos, colPos) {
    return `${colPos},${rowPos}`
}

// get the coordinate of the top left cell of a particular 3 by 3 subgrid
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

function checkColValidity(colPos, numToCheck, sudokuPuzzle) {
    const col = sudokuPuzzle.map((row) => row[colPos])

    return !col.includes(numToCheck)
}

function checkRowValidity(rowPos, numToCheck, sudokuPuzzle) {
    const row = sudokuPuzzle[rowPos]

    return !row.includes(numToCheck)
}

// return false if have duplicates, true otherwise
function checkSubGridValidity(rowPos, colPos, numToCheck, sudokuPuzzle) {
    const gridIndex = getGridIndexFromCoordinate(rowPos, colPos)

    const [row, col] = getRowColFromGridIndex(gridIndex)

    for (let x = col; x < col + SUDOKU_SUBGRID_SIZE; x++) {
        for (let y = row; y < row + SUDOKU_SUBGRID_SIZE; y++) {
            const value = sudokuPuzzle[y][x]

            if (value === numToCheck) {
                return false
            }
        }
    }

    return true
}

function checkCellValidity(rowPos, colPos, numToCheck, sudokuPuzzle) {
    const colIsValid = checkColValidity(colPos, numToCheck, sudokuPuzzle)
    if (!colIsValid) {
        return false
    }
    
    const rowIsValid = checkRowValidity(rowPos, numToCheck, sudokuPuzzle)
    if (!rowIsValid) {
        return false
    }
    

    const gridIsValid = checkSubGridValidity(rowPos, colPos, numToCheck, sudokuPuzzle)
    if (!gridIsValid) {
        return false
    }

    return true
}

function backtrack(position, cellsPlaced, numOfCellsToPlace, sudokuPuzzle) {
    if (cellsPlaced === numOfCellsToPlace) {
        solution = sudokuPuzzle.map((row) => [...row])
        return true
    }

    const [row, col] = getCoordinateFromPosition(position)
    const coordinateAsString = getCoordinateAsString(row, col)

    // don't modify original values
    if (originalValues.has(coordinateAsString)) {
        return backtrack(position + 1, cellsPlaced, numOfCellsToPlace, sudokuPuzzle)
    }

    for (const number of VALID_NUMBERS) {
        const cellIsValid = checkCellValidity(row, col, number, sudokuPuzzle)
        if (cellIsValid) {
            sudokuPuzzle[row][col] = number

            if (backtrack(position + 1, cellsPlaced + 1, numOfCellsToPlace, sudokuPuzzle)) {
                return true
            }
        }

        sudokuPuzzle[row][col] = EMPTY_CELL
    }

    return false
}

async function getSudokuPuzzle(filepath) {
    const file = Bun.file(filepath)

    const text = await file.text()

    const lines = text.split("\n")

    const sudokuPuzzle = []

    lines.forEach((line) => {
        sudokuPuzzle.push(line.split(" ").map((num) => parseInt(num)))
    })
    
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

            if (isNaN(value)) {
                return `Value at row ${j} column ${i} is not a number. Each cell value must be between 0 to 9.`
            }

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

    const parsedSolution = parseSudokuAsString(solution)

    console.log("Solution\n")
    console.log(parsedSolution)
}