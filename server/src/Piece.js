// Piece.js

const shapes = {
    O: [
        [1, 1],
        [1, 1]
    ],
    I: [
        [2],
        [2],
        [2],
        [2]
    ],
    L: [
        [3, 0],
        [3, 0],
        [3, 3]
    ],
    J: [
        [0, 4],
        [0, 4],
        [4, 4]
    ],
    T: [
        [5, 5, 5],
        [0, 5, 0]
    ],
    Z: [
        [6, 6, 0],
        [0, 6, 6]
    ],
    S: [
        [0, 7, 7],
        [7, 7, 0]
    ]
};

class Piece {
    constructor() {
        const pieces = Object.values(shapes);
        const randomIndex = Math.floor(Math.random() * pieces.length);
        this.shape = pieces[randomIndex];
    }

    
    rotatePieceLeft() {
        const rotatedPiece = [];
        const rows = this.shape.length;
        const cols = this.shape[0].length;
    
        for (let col = cols - 1; col >= 0; col--) {
            const newRow = [];
            for (let row = 0; row < rows; row++) {
                newRow.push(this.shape[row][col]);
            }
            rotatedPiece.push(newRow);
        }
    
        this.shape = rotatedPiece;
    };
    
    rotatePieceRight() {
        const rotatedPiece = [];
        const rows = this.shape.length;
        const cols = this.shape[0].length;
    
        for (let col = 0; col < cols; col++) {
            const newRow = [];
            for (let row = rows - 1; row >= 0; row--) {
                newRow.push(this.shape[row][col]);
            }
            rotatedPiece.push(newRow);
        }
    
        this.shape = rotatedPiece;
    };
    
}

module.exports = Piece;
