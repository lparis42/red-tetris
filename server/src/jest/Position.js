const Position = require('../Position');

const runPositionTests = () => {
    describe('Position', () => {
        test('constructor should initialize a position', () => {
            const shape = [
                [1, 1],
                [1, 1]
            ];
            const position = new Position(shape);
            expect(position.row).toBe(-2);
            expect(position.col).toBeGreaterThanOrEqual(0);
            expect(position.col).toBeLessThanOrEqual(9);
        });
    })
};

module.exports = runPositionTests;