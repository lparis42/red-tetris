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
}

module.exports = Piece;
