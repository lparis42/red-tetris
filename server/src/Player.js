// Player.js

const ROWS = 20;
const COLS = 10;

class Player {
    constructor(id) {
        this.id = id;
        this.roomId = null;
        this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
        this.currentPiece = null;
        this.currentPosition = null;
        this.isGameStart = false;
        this.resetInterval = {
            interval: null,
            set(fn, time) {
                clearInterval(this.interval);
                this.interval = setInterval(fn, time);
            },
            clear() {
                clearInterval(this.interval);
            }
        };
    }

    isPieceCanMove() {
        // Logique pour vérifier le déplacement de la pièce
        for (let r = 0; r < this.currentPiece.shape.length; r++) {
            for (let c = 0; c < this.currentPiece.shape[r].length; c++) {
                if (this.currentPiece.shape[r][c]) {
                    const newRow = this.currentPosition.row + r;
                    const newCol = this.currentPosition.col + c;

                    // Vérifier si la nouvelle position est en dehors des limites
                    if (newRow >= ROWS || newCol < 0 || newCol > COLS) {
                        return false;
                    }

                    // Vérifier s'il y a collision avec un bloc existant
                    if (this.grid[newRow][newCol] !== 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    addPieceToGrid() {
        // Logique pour mettre à jour la grille
        this.currentPiece.shape.forEach((rowPiece, rowIndex) => {
            rowPiece.forEach((cell, colIndex) => {
                if (cell === 1) {
                    this.grid[this.currentPosition.row + rowIndex][this.currentPosition.col + colIndex] = this.currentPiece.color;
                }
            });
        });
    }

    removePieceToGrid() {
        // Logique pour mettre à jour la grille
        this.currentPiece.shape.forEach((rowPiece, rowIndex) => {
            rowPiece.forEach((cell, colIndex) => {
                if (cell === 1) {
                    this.grid[this.currentPosition.row + rowIndex][this.currentPosition.col + colIndex] = 0;
                }
            });
        });
    }

    checkAndRemoveCompletedLines() {
        // Logique supprimer les lignes complètes
        for (let row = 0; row < this.grid.length; row++) {
            let isCompleted = true;
            for (let col = 0; col < this.grid[row].length; col++) {
                if (this.grid[row][col] === 0) {
                    isCompleted = false;
                    break;
                }
            }
            if (isCompleted) {
                completedLinesExist = true;
                this.grid.splice(row, 1);
                this.grid.unshift(Array(COLS).fill(0));
                break;
            }
        }
    }

    gameEnd() {
        this.resetInterval.clear();
        this.currentPiece = null;
        this.currentPosition = null;
        this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }
}

module.exports = Player;
