// Player.js

const ROWS = 20;
const COLS = 10;

class Player
{
    #id;
    #name;
    #room;

    constructor(id)
    {
        this.#id = id;
        this.#name = null;
        this.#room = null;

        this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
        this.currentPiece = null;
        this.currentPosition = null;
        this.nextPiece = null;
        this.holdPiece = null;
        this.penalty = 0;
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

    static isValidName(name)
    {
        return (/^(?:\w){3,16}$/.test(name));
    }

    isInRoom(room = undefined)
    {
        if ( ! room || ! this.room )
        {
            return ( !! this.room );
        }

        return ( this.room.id === room.id );
    }

    joinRoom(room)
    {
        // Should never happen
        if ( this.#room )
        {
            room.removePlayer(this);
        }

        this.#room = room;
        room.addPlayer(this);
    }


    isPieceCanMove() {
        // Logique pour vérifier le déplacement de la pièce
        for (let r = 0; r < this.currentPiece.shape.length; r++) {
            for (let c = 0; c < this.currentPiece.shape[r].length; c++) {
                if (this.currentPiece.shape[r][c]) {
                    const newRow = this.currentPosition.row + r;
                    const newCol = this.currentPosition.col + c;

                    // Vérifier si la nouvelle position est en dehors des limites
                    if (newRow >= ROWS || newCol < 0 || newCol >= COLS) {
                        return false;
                    }

                    if (newRow < 0) {
                        continue;
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

    addPenalty() {
        while (this.penalty > 0) {
            this.grid.shift();
            this.grid.push(Array(10).fill(-1));
            this.penalty--;
        }
    }

    addPieceToGrid() {
        // Logique pour mettre à jour la grille
        this.currentPiece.shape.forEach((rowPiece, rowIndex) => {
            rowPiece.forEach((cell, colIndex) => {
                if (cell >= 1 && this.currentPosition.row + rowIndex >= 0) {
                    this.grid[this.currentPosition.row + rowIndex][this.currentPosition.col + colIndex] = cell;
                }
            });
        });
    }

    removeCompletedLines() {
        // Logique supprimer les lignes complètes
        let completedLines = 0;
        for (let row = 0; row < this.grid.length; row++) {
            let isCompleted = true;
            for (let col = 0; col < this.grid[row].length; col++) {
                if (this.grid[row][col] <= 0) {
                    isCompleted = false;
                    break;
                }
            }
            if (isCompleted) {
                completedLines++;
                this.grid.splice(row, 1);
                this.grid.unshift(Array(COLS).fill(0));
            }
        }
        return completedLines;
    }

    calculateSpectrum() {
        const spectrum = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

        // Pour chaque colonne, trouver la première ligne occupée par une pièce
        for (let col = 0; col < COLS; col++) {
            let foundPiece = false;
            // Parcourir chaque ligne de la colonne
            for (let row = 0; row < ROWS; row++) {
                if (this.grid[row][col] !== 0) {
                    foundPiece = true;
                }
                if (foundPiece) {
                    spectrum[row][col] = -2;
                }
            }
        }

        return spectrum;
    }

    isGameEnd() {
        for (let col = 0; col < COLS; col++) {
            if (this.grid[0][col]) {
                this.isGameStart = false;
                this.currentPiece = null;
                this.currentPosition = null;
                this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
                this.resetInterval.clear();
                return true;
            }
        }
        return false;
    }
}

module.exports = Player;
