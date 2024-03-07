// Position.js

const COLS = 10;

class Position {
    constructor(shape) {
        const rows = shape.length;
        const cols = shape[0].length;

        this.row = -rows;
        this.col = Math.floor(Math.random() * (COLS - cols + 1));
    }
}

module.exports = Position;
