const Server = require('../Server');
const Player = require('../Player');
const generateNewConnections = require('./Help');

const runRoomCreateTests = () => {
    describe('handleRoomCreate', () => {
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

        test('should handle room creation successfully', () => {
            // Setup
            const payload = { id: 'testRoomId', mode: 'Standard' };

            // Execution
            server.gameManager.handleRoomCreate(testSockets[0], payload, jest.fn());

            // Assertion
            expect(testSockets[0].join).toHaveBeenCalledWith('testRoomId');
            expect(testSockets[0].emit).toHaveBeenCalledWith('tetris:room:joined', expect.any(Object));
            expect(testSockets[0].emit).toHaveBeenCalledWith('tetris:room:updated', expect.any(Object));
            expect(server.gameManager.rooms['testRoomId']).toBeDefined();
            const createdRoom = server.gameManager.rooms['testRoomId'];
            expect(createdRoom.mode).toBe('Standard');
            expect(createdRoom.players.length).toBe(1);
            expect(createdRoom.leader).toBe(server.gameManager.players[0].id);
            expect(createdRoom.active).toBe(false);
        });

        test('should handle room join if room ID already exists', () => {
            // Setup
            const payload = { id: 'existingRoomId', mode: 'Standard' };
            server.gameManager.handleRoomCreate(testSockets[0], payload, jest.fn());
            
            // Execution
            const handleRoomJoinSpy = jest.spyOn(server.gameManager, 'handleRoomJoin');
            server.gameManager.handleRoomCreate(testSockets[1], payload, jest.fn());
            
            // Assertion
            expect(handleRoomJoinSpy).toHaveBeenCalled();
        });        

        test('should return early if socket is not an object', () => {
            // Execution
            server.gameManager.handleRoomCreate('notAnObject', { id: 'testRoomId', mode: 'Standard' }, jest.fn());

            // Assertion
            expect(testSockets[0].join).not.toHaveBeenCalled();
            expect(testSockets[0].emit).not.toHaveBeenCalled();
        });

        test('should return early if payload is not an object or empty', () => {
            // Execution
            server.gameManager.handleRoomCreate(testSockets[0], null, jest.fn());
            server.gameManager.handleRoomCreate(testSockets[0], {}, jest.fn());

            // Assertion
            expect(testSockets[0].join).not.toHaveBeenCalled();
            expect(testSockets[0].emit).not.toHaveBeenCalled();
        });

        test('should return early if callback is not a function', () => {
            // Execution
            server.gameManager.handleRoomCreate(testSockets[0], { id: 'testRoomId', mode: 'Standard' }, null);

            // Assertion
            expect(testSockets[0].join).not.toHaveBeenCalled();
            expect(testSockets[0].emit).not.toHaveBeenCalled();
        });

        test('should return early if player is not found', () => {
            // Setup
            const originalPlayerId = server.gameManager.players[0].id;
            server.gameManager.players[0].id = 'testId';

            // Execution
            server.gameManager.handleRoomCreate(testSockets[0], { id: 'testRoomId', mode: 'Standard' }, jest.fn());

            // Assertion
            expect(testSockets[0].join).not.toHaveBeenCalled();
            expect(testSockets[0].emit).not.toHaveBeenCalled();

            // Reset player id
            server.gameManager.players[0].id = originalPlayerId;
        });

        test('should return early if player is already in a room', () => {
            // Setup
            server.gameManager.players[0].roomId = 'existingRoomId';

            // Execution
            server.gameManager.handleRoomCreate(testSockets[0], { id: 'testRoomId', mode: 'Standard' }, jest.fn());

            // Assertion
            expect(testSockets[0].join).not.toHaveBeenCalled();
            expect(testSockets[0].emit).not.toHaveBeenCalled();
        });

        test('should return early if mode is invalid', () => {
            // Execution
            server.gameManager.handleRoomCreate(testSockets[0], { id: 'testRoomId', mode: 'InvalidMode' }, jest.fn());

            // Assertion
            expect(testSockets[0].join).not.toHaveBeenCalled();
            expect(testSockets[0].emit).not.toHaveBeenCalled();
        });
    })
};

module.exports = runRoomCreateTests;
