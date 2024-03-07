// Piece.js

const shapes = {
    O: [
        [1, 1],
        [1, 1]
    ],
    I: [
        [1],
        [1],
        [1],
        [1]
    ],
    L: [
        [1, 0],
        [1, 0],
        [1, 1]
    ],
    J: [
        [0, 1],
        [0, 1],
        [1, 1]
    ],
    T: [
        [1, 1, 1],
        [0, 1, 0]
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1]
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0]
    ]
};

class Piece {
    constructor() {
        // Logique pour générer une pièce aléatoire
        const pieces = Object.values(shapes);
        const randomIndex = Math.floor(Math.random() * pieces.length);
        this.shape = pieces[randomIndex];
        this.color = randomIndex + 1;
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
