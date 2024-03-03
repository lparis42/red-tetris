// Position.js

const COLS = 10;

class Position {
    constructor(pieceLength) {
        this.row = 0;
        this.col = Math.floor(Math.random() * (COLS - pieceLength + 1));
    }
}

module.exports = Position;
