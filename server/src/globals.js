const ROWS = 20;
const COLS = 10;

const players = [];
const rooms = {};

const tetrisPieces = {
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

module.exports = { ROWS, COLS, players, rooms, tetrisPieces };