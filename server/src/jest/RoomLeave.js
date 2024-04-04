const Server = require('../Server');
const Player = require('../Player');
const generateNewConnections = require('./Help');

const runRoomLeaveTests = () => {
    describe('handleRoomLeave', () => {
        let server;
        let testSockets;

        beforeAll((done) => {
            server = new Server();
            testSockets = generateNewConnections(server, 2);
            for (let i = 0; i < 2; i++) {
                server.gameManager.handlePlayerRename(testSockets[i], { name: `name${i}` }, jest.fn());
            }
            done();
        });

        afterAll((done) => {
            server.closeServer(done);
        });

        afterEach(() => {
            // Reset player data
            server.gameManager.players.forEach(player => {
                Object.assign(player, new Player(player.id, player.name));
            });

            // Clear room data
            server.gameManager.rooms = {};

            // Clear all mocks
            jest.clearAllMocks();
        });

        test('should handle room leave successfully for player who is leader', () => {
            // Setup
            server.gameManager.handleRoomCreate(testSockets[0], { id: 'existingRoomId', mode: 'Standard' }, jest.fn());

            // Execution
            server.gameManager.handleRoomLeave(testSockets[0]);

            // Assertion
            expect(server.gameManager.players[0].roomId).toBeNull();
            expect(server.gameManager.rooms['existingRoomId']).toBeUndefined();
            expect(testSockets[0].emit).toHaveBeenCalledWith('tetris:room:leave');
        });

        test('should handle room leave successfully for player who is not leader', () => {
            // Setup
            const leaderSocket = testSockets[1];
            const playerSocket = testSockets[0];
            server.gameManager.handleRoomCreate(leaderSocket, { id: 'existingRoomId', mode: 'Standard' }, jest.fn());
            server.gameManager.handleRoomJoin(playerSocket, { id: 'existingRoomId' }, jest.fn());

            // Execution
            server.gameManager.handleRoomLeave(playerSocket);

            // Assertion
            expect(server.gameManager.players[0].roomId).toBeNull();
            expect(server.gameManager.rooms['existingRoomId'].players).not.toContain(playerSocket.id);
            expect(playerSocket.emit).toHaveBeenCalledWith('tetris:room:leave');
            expect(leaderSocket.emit).toHaveBeenCalledWith('tetris:room:updated', expect.any(Object));
        });

        test('should return early if socket is not an object', () => {
            // Execution
            server.gameManager.handleRoomLeave('notAnObject');

            // Assertion
            expect(testSockets[0].emit).not.toHaveBeenCalled();
        });

        test('should return early if player is not found', () => {
            // Setup
            const originalPlayerId = server.gameManager.players[0].id;
            const playerSocket = testSockets[0];
            server.gameManager.players[0].id = 'testId';

            // Execution
            server.gameManager.handleRoomLeave(playerSocket);

            // Assertion
            expect(playerSocket.emit).not.toHaveBeenCalled();

            // Reset player id
            server.gameManager.players[0].id = originalPlayerId;
        });

        test('should return early if player is not in a room', () => {
            // Execution
            const playerSocket = testSockets[0];
            server.gameManager.handleRoomLeave(playerSocket);

            // Assertion
            expect(playerSocket.emit).not.toHaveBeenCalled();
        });

        test('should return early if room is not found', () => {
            // Setup
            const playerSocket = testSockets[0];
            server.gameManager.players[0].roomId = 'nonExistingRoomId';

            // Execution
            server.gameManager.handleRoomLeave(playerSocket);

            // Assertion
            expect(playerSocket.emit).not.toHaveBeenCalled();
        });

        test('should return early if player is not in the room', () => {
            // Setup
            const roomId = 'existingRoomId';
            const leaderSocket = testSockets[1];
            const playerSocket = testSockets[0];
            server.gameManager.handleRoomCreate(leaderSocket, { id: roomId, mode: 'Standard' }, jest.fn());

            // Execution
            server.gameManager.handleRoomLeave(playerSocket);

            // Assertion
            expect(playerSocket.emit).not.toHaveBeenCalled();
        });

    })
};

module.exports = runRoomLeaveTests;
