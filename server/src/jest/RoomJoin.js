const Server = require('../Server');
const Player = require('../Player');
const generateNewConnections = require('./Help');

const runRoomJoinTests = () => {
    describe('handleRoomJoin', () => {
        let server;
        let testSockets;

        beforeAll((done) => {
            server = new Server();
            testSockets = generateNewConnections(server, 10);
            for (let i = 0; i < 10; i++) {
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

        test('should handle room join successfully', () => {
            // Setup
            const payload = { id: 'existingRoomId' };
            server.gameManager.handleRoomCreate(testSockets[1], { id: 'existingRoomId', mode: 'Standard' }, jest.fn());

            // Execution
            server.gameManager.handleRoomJoin(testSockets[0], payload, jest.fn());

            // Assertion
            expect(testSockets[0].join).toHaveBeenCalledWith('existingRoomId');
            expect(testSockets[0].emit).toHaveBeenCalledWith('tetris:room:joined', expect.any(Object));
            const joinedRoom = server.gameManager.rooms['existingRoomId'];
            expect(joinedRoom.players).toContain(testSockets[0].id);
        });

        test('should handle room join by creating room if room does not exist', () => {
            // Setup
            const payload = { id: 'nonExistingRoomId' };

            // Execution
            const handleRoomCreateSpy = jest.spyOn(server.gameManager, 'handleRoomCreate');
            server.gameManager.handleRoomJoin(testSockets[0], payload, jest.fn());

            // Assertion
            expect(handleRoomCreateSpy).toHaveBeenCalled();
        });

        test('should return early if socket is not an object', () => {
            // Execution
            server.gameManager.handleRoomJoin('notAnObject', { id: 'existingRoomId' }, jest.fn());

            // Assertion
            expect(testSockets[0].join).not.toHaveBeenCalled();
            expect(testSockets[0].emit).not.toHaveBeenCalled();
        });

        test('should return early if payload is not an object or empty', () => {
            // Execution
            server.gameManager.handleRoomJoin(testSockets[0], null, jest.fn());
            server.gameManager.handleRoomJoin(testSockets[0], {}, jest.fn());

            // Assertion
            expect(testSockets[0].join).not.toHaveBeenCalled();
            expect(testSockets[0].emit).not.toHaveBeenCalled();
        });

        test('should return early if callback is not a function', () => {
            // Execution
            server.gameManager.handleRoomJoin(testSockets[0], { id: 'existingRoomId' }, null);

            // Assertion
            expect(testSockets[0].join).not.toHaveBeenCalled();
            expect(testSockets[0].emit).not.toHaveBeenCalled();
        });

        test('should return early if player is not found', () => {
            // Setup
            const originalPlayerId = server.gameManager.players[0].id;
            server.gameManager.players[0].id = 'testId';

            // Execution
            server.gameManager.handleRoomJoin(testSockets[0], { id: 'existingRoomId' }, jest.fn());

            // Assertion
            expect(testSockets[0].join).not.toHaveBeenCalled();
            expect(testSockets[0].emit).not.toHaveBeenCalled();

            // Reset player id
            server.gameManager.players[0].id = originalPlayerId;
        });

        test('should return early if room is full', () => {
            // Setup
            const payload = { id: 'existingRoomId' };
            server.gameManager.handleRoomCreate(testSockets[1], { id: 'existingRoomId', mode: 'Standard' }, jest.fn());
            for (let i = 2; i < 10; i++) {
                server.gameManager.handleRoomJoin(testSockets[i], payload, jest.fn());
            }
            
            // Execution
            server.gameManager.handleRoomJoin(testSockets[0], payload, jest.fn());

            // Assertion
            expect(testSockets[0].join).not.toHaveBeenCalled();
            expect(testSockets[0].emit).not.toHaveBeenCalled();
        });

        test('should return early if room is currently playing', () => {
            // Setup
            const payload = { id: 'existingRoomId' };
            server.gameManager.handleRoomCreate(testSockets[1], { id: 'existingRoomId', mode: 'Standard' }, jest.fn());
            server.gameManager.rooms['existingRoomId'].active = true;

            // Execution
            server.gameManager.handleRoomJoin(testSockets[0], payload, jest.fn());

            // Assertion
            expect(testSockets[0].join).not.toHaveBeenCalled();
            expect(testSockets[0].emit).not.toHaveBeenCalled();
        });
    });
};

module.exports = runRoomJoinTests;
