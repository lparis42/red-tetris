const Server = require('../Server');
const Player = require('../Player');
const generateNewConnections = require('./Help');

const runRoomGameStartTests = () => {
    describe('handleRoomGameStart', () => {
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

        afterEach(() => {
            // Reset player data
            server.gameManager.players.forEach(player => {
                player.resetInterval.clear();
                Object.assign(player, new Player(player.id, player.name));
            });

            // Clear room data
            server.gameManager.rooms = {};

            // Clear all mocks
            jest.clearAllMocks();
        });

        afterAll((done) => {
            server.closeServer(done);
        });
        test('should return early if socket is not provided', () => {
            // Setup
            const mockSocket = null;

            // Execution
            const result = server.gameManager.handleRoomGameStart(mockSocket);

            // Assertion
            expect(result).toBeUndefined();
        });

        test('should return early if socket is not an object', () => {
            // Setup
            const mockSocket = 'not an object';

            // Execution
            const result = server.gameManager.handleRoomGameStart(mockSocket);

            // Assertion
            expect(result).toBeUndefined();
        });

        test('should return early if player is not found', () => {
            // Setup
            const mockSocket = { id: 'mockSocketId' };
            jest.spyOn(server.gameManager.players, 'find').mockReturnValueOnce(undefined);

            // Execution
            const result = server.gameManager.handleRoomGameStart(mockSocket);

            // Assertion
            expect(result).toBeUndefined();
        });

        test('should return early if player has no room', () => {
            // Setup
            const mockSocket = { id: 'mockSocketId' };
            const mockPlayer = { id: 'mockPlayerId', roomId: null }; // No room assigned
            jest.spyOn(server.gameManager.players, 'find').mockReturnValueOnce(mockPlayer);

            // Execution
            const result = server.gameManager.handleRoomGameStart(mockSocket);

            // Assertion
            expect(result).toBeUndefined();
        });

        test('should start the game in the room', () => {
            // Setup
            const roomId = 'room0';
            server.gameManager.handleRoomCreate(testSockets[0], { id: roomId, mode: 'Standard' }, jest.fn());
            server.gameManager.handleRoomJoin(testSockets[1], { id: roomId }, jest.fn());

            // Execution
            server.gameManager.handleRoomGameStart(testSockets[0]);

            // Assertion
            const room = server.gameManager.rooms[roomId];
            const player1 = server.gameManager.players.find(player => player.id === testSockets[0].id);
            const player2 = server.gameManager.players.find(player => player.id === testSockets[1].id);

            // Assert room is active
            expect(room.active).toBe(true);

            // Assert players' game status is true
            expect(player1.game).toBe(true);
            expect(player2.game).toBe(true);
        });
        test('should update the falling interval', () => {
            // Setup
            const roomId = 'room0';
            server.gameManager.handleRoomCreate(testSockets[0], { id: roomId, mode: 'Standard' }, jest.fn());
            server.gameManager.handleRoomJoin(testSockets[1], { id: roomId }, jest.fn());
            server.gameManager.handleRoomGameStart(testSockets[0]);

            // Execution
            server.gameManager.updateIntervalFall(testSockets[0], server.gameManager.players[0], server.gameManager.rooms[roomId], 0, 800);
        });
    });
};

module.exports = runRoomGameStartTests;
