const Player = require('../Player');

const runPlayerTests = () => {
    describe('Player', () => {
        let player;

        beforeEach(() => {
            player = new Player('testPlayerId');
            player.grid = Array.from({ length: 20 }, () => Array(10).fill(0));
        });

        test('constructor should initialize a player', () => {
            expect(player.id).toBe('testPlayerId');
            expect(player.name).toBe('testPlayerId');
            expect(player.roomId).toBeNull();
            expect(player.grid.length).toBe(20);
            expect(player.grid[0].length).toBe(10);
            expect(player.currentPiece).toBeNull();
            expect(player.currentPosition).toBeNull();
            expect(player.nextPiece).toBeNull();
            expect(player.holdPiece).toBeNull();
            expect(player.hold).toBe(0);
            expect(player.penalty).toBe(0);
            expect(player.game).toBe(false);
            expect(player.score).toBe(0);
            expect(player.resetInterval.interval).toBeNull();
        });

        test('isPieceCanMove should return true if piece can move', () => {
            player.currentPiece = { shape: [[0, 1], [0, 1]] };
            player.currentPosition = { row: 0, col: 0 };
            expect(player.isPieceCanMove()).toBe(true);
        });

        test('isPieceCanMove should return false if piece cannot move due to grid boundary', () => {
            player.currentPiece = { shape: [[1, 1], [1, 1]] };
            player.currentPosition = { row: 19, col: 8 };
            expect(player.isPieceCanMove()).toBe(false);
        });

        test('isPieceCanMove should return false if piece cannot move due to collision', () => {
            player.currentPiece = { shape: [[1, 1], [1, 1]] };
            player.currentPosition = { row: 0, col: 0 };
            player.grid[1][0] = 1;
            expect(player.isPieceCanMove()).toBe(false);
        });

        test('addPenalty should add penalty rows to the grid', () => {
            player.penalty = 2;
            player.grid = [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ];
            player.addPenalty();
            expect(player.grid.length).toBe(5);
            expect(player.grid[4].every(cell => cell === -1)).toBe(true);
            expect(player.grid[4].filter(cell => cell === -1).length).toBe(10);
            expect(player.grid[3].every(cell => cell === -1)).toBe(true);
            expect(player.grid[3].filter(cell => cell === -1).length).toBe(10);
        });

        test('addPieceToGrid should add current piece to the grid', () => {
            player.currentPiece = { shape: [[1, 1], [1, 1]] };
            player.currentPosition = { row: 0, col: 0 };
            player.addPieceToGrid();
            expect(player.grid[0][0]).toBe(1);
            expect(player.grid[0][1]).toBe(1);
            expect(player.grid[1][0]).toBe(1);
            expect(player.grid[1][1]).toBe(1);
        });

        test('removeCompletedLines should remove completed lines from the grid and return number of lines removed', () => {
            player.grid = [
                [0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ];
            const linesRemoved = player.removeCompletedLines();
            expect(linesRemoved).toBe(3);
            expect(player.grid.length).toBe(5);
            expect(player.grid[0].every(cell => cell === 0)).toBe(true);
            expect(player.grid[0].length).toBe(10);
            expect(player.grid[1].every(cell => cell === 0)).toBe(true);
            expect(player.grid[1].length).toBe(10);
            expect(player.grid[2].every(cell => cell === 0)).toBe(true);
            expect(player.grid[2].length).toBe(10);
            expect(player.grid[3].every(cell => cell === 0)).toBe(false);
            expect(player.grid[3].length).toBe(10);
            expect(player.grid[4].every(cell => cell === 0)).toBe(false);
            expect(player.grid[4].length).toBe(10);
        });

        test('calculateSpectrum should calculate the spectrum of the grid', () => {
            player.grid = [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
                [0, 1, 0, 1, 1, 1, 1, 0, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
                [0, 0, 0, 1, 0, 1, 0, 0, 0, 0]
            ];
            const spectrum = player.calculateSpectrum();
            expect(spectrum.length).toBe(20);
            expect(spectrum[15].filter(cell => cell === -2).length).toBe(2);
            expect(spectrum[16].filter(cell => cell === -2).length).toBe(7);
            expect(spectrum[17].filter(cell => cell === -2).length).toBe(9);
            expect(spectrum[18].filter(cell => cell === -2).length).toBe(9);
            expect(spectrum[19].filter(cell => cell === -2).length).toBe(9);
        });

        test('closeGame should reset player game-related attributes', () => {
            player.currentPiece = {};
            player.currentPosition = {};
            player.nextPiece = {};
            player.holdPiece = {};
            player.hold = 1;
            player.penalty = 2;
            player.game = true;
            player.score = 100;
            player.resetInterval.interval = setInterval(() => { }, 1000);
            player.closeGame();
            expect(player.currentPiece).toBeNull();
            expect(player.currentPosition).toBeNull();
            expect(player.nextPiece).toBeNull();
            expect(player.holdPiece).toBeNull();
            expect(player.hold).toBe(0);
            expect(player.penalty).toBe(0);
            expect(player.game).toBe(false);
            expect(player.score).toBe(0);
            expect(player.resetInterval.interval).not.toEqual(expect.any(Number));
        });

        test('isGameEnd should return true if grid top row has filled cells', () => {
            player.grid[0] = Array(10).fill(1);
            expect(player.isGameEnd()).toBe(true);
        });

        test('isGameEnd should return false if grid top row does not have filled cells', () => {
            player.grid[0] = Array(10).fill(0);
            expect(player.isGameEnd()).toBe(false);
        });
    })
};

module.exports = runPlayerTests;