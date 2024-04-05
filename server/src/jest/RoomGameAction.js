const Server = require('../Server');
const Player = require('../Player');
const generateNewConnections = require('./Help');

const runRoomGameActionTests = () => {
    describe('handleRoomGameAction', () => {
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

        beforeEach(() => {
            const roomId = 'room0';
            server.gameManager.handleRoomCreate(testSockets[0], { id: roomId, mode: 'Standard' }, jest.fn());
            server.gameManager.handleRoomJoin(testSockets[1], { id: roomId }, jest.fn());
            server.gameManager.handleRoomGameStart(testSockets[0]);
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

        afterAll((done) => {
            server.closeServer(done);
        });

        test('should return early if socket is not provided or invalid', () => {
            const invalidSocket = null;
            server.gameManager.handleRoomGameAction(invalidSocket, { action: 'hold' });
        });

        test('should return early if payload is not provided, not an object, or empty', () => {
            const invalidPayloads = [null, undefined, '', 0, [], { action: undefined }];

            invalidPayloads.forEach(payload => {
                server.gameManager.handleRoomGameAction(testSockets[0], payload);
            });
        });

        test('should return early if action is not valid', () => {
            const invalidActions = ['invalid-action'];

            invalidActions.forEach(action => {
                server.gameManager.handleRoomGameAction(testSockets[0], { action: action });
            });
        });

        test('should return early if player is not found or not in the game', () => {
            const originalId = server.gameManager.players[0].id;
            server.gameManager.players[0].id = 'testId';

            server.gameManager.handleRoomGameAction(testSockets[0], { action: 'move-down' });

            server.gameManager.players[0].id = originalId;
        });

        test('should return early if player is locked or room is invalid', () => {
            server.gameManager.players[0].lock = true;

            server.gameManager.handleRoomGameAction(testSockets[0], { action: 'move-down' });

            server.gameManager.players[0].lock = false;

            const originalRoomId = server.gameManager.players[0].roomId;
            server.gameManager.players[0].roomId = null;

            server.gameManager.handleRoomGameAction(testSockets[0], { action: 'move-down' });

            server.gameManager.players[0].roomId = originalRoomId;
        });

        test('should handle move-left action', () => {
            server.gameManager.handleRoomGameAction(testSockets[0], { action: 'move-left' });
        });
        
        test('should handle move-right action', () => {
            server.gameManager.handleRoomGameAction(testSockets[0], { action: 'move-right' });
        });
        
        test('should handle move-down action', () => {
            server.gameManager.handleRoomGameAction(testSockets[0], { action: 'move-down' });
        });
        
        test('should handle move-space action', () => {
            server.gameManager.handleRoomGameAction(testSockets[0], { action: 'move-space' });
        });
        
        test('should handle rotate-left action', () => {
            server.gameManager.handleRoomGameAction(testSockets[0], { action: 'rotate-left' });
        });
        
        test('should handle rotate-right action', () => {
            server.gameManager.handleRoomGameAction(testSockets[0], { action: 'rotate-right' });
        });
        
        test('should handle hold action', () => {
            server.gameManager.handleRoomGameAction(testSockets[0], { action: 'hold' });
        });
    });
};

module.exports = runRoomGameActionTests;
