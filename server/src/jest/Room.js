const Room = require('../Room');

const runRoomTests = () => {
    describe('Room', () => {
        let room;
        const leader = 'leaderPlayerId';
        const mode = 'Standard';

        beforeEach(() => {
            room = new Room(leader, mode);
        });

        test('constructor should initialize with leader and mode', () => {
            expect(room.leader).toBe(leader);
            expect(room.mode).toBe(mode);
        });

        test('should have leader as the first player', () => {
            expect(room.players).toEqual([leader]);
        });

        test('addPlayer should add a player to the room', () => {
            const player = 'newPlayerId';
            room.addPlayer(player);
            expect(room.players).toContain(player);
        });

        test('removePlayer should remove a player from the room', () => {
            const player = 'playerToRemove';
            room.addPlayer(player);
            room.removePlayer(player);
            expect(room.players).not.toContain(player);
        });

        test('addPiece should add a piece and its position to the room', () => {
            const piece = 'T';
            const position = { x: 0, y: 0 };
            room.addPiece(piece, position);
            expect(room.pieces).toContain(piece);
            expect(room.positions).toContain(position);
        });
    });
};

module.exports = runRoomTests;
