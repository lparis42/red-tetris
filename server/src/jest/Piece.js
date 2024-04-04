const Piece = require('../Piece');

const runPieceTests = () => {
    describe('Piece', () => {
        let piece;

        beforeEach(() => {
            piece = new Piece();
        });

        test('constructor should initialize a random shape', () => {
            expect(piece.shape).toBeDefined();
        });

        test('rotatePieceLeft should rotate the piece left', () => {
            const originalShape = JSON.stringify(piece.shape);
            piece.rotatePieceLeft();
            const rotatedShape = JSON.stringify(piece.shape);

            if (originalShape === JSON.stringify([[1, 1], [1, 1]])) {
                expect(rotatedShape).toEqual(originalShape);
            } else {
                expect(rotatedShape).not.toEqual(originalShape);
            }
        });

        test('rotatePieceRight should rotate the piece right', () => {
            const originalShape = JSON.stringify(piece.shape);
            piece.rotatePieceRight();
            const rotatedShape = JSON.stringify(piece.shape);

            if (originalShape === JSON.stringify([[1, 1], [1, 1]])) {
                expect(rotatedShape).toEqual(originalShape);
            } else {
                expect(rotatedShape).not.toEqual(originalShape);
            }
        });

    })
};

module.exports = runPieceTests;