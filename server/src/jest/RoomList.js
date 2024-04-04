const Server = require('../Server');
const Player = require('../Player');
const generateNewConnections = require('./Help');

const runRoomListTests = () => {
    describe('handleRoomList', () => {
        let server;
        let testSockets;

        beforeAll((done) => {
            server = new Server();
            testSockets = generateNewConnections(server, 2);
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

        it('should not handle room list if socket is not an object', () => {
            // Execution
            const callback = jest.fn();
            server.gameManager.handleRoomList(null, { id: '123' }, callback);

            // Assertion
            expect(callback).not.toHaveBeenCalled();
        });

        it('should not handle room list if payload is not an object or empty', () => {
            // Execution and Assertion
            expect(server.gameManager.handleRoomList(testSockets[0], null, jest.fn())).toBeUndefined();
            expect(server.gameManager.handleRoomList(testSockets[0], {}, jest.fn())).toBeUndefined();
        });

        it('should not handle room list if callback is not a function', () => {
            // Execution and Assertion
            expect(server.gameManager.handleRoomList(testSockets[0], { id: '123' }, null)).toBeUndefined();
        });

        it('should handle room list and return empty list if no matching rooms', () => {
            // Setup
            const callback = jest.fn();

            // Execution
            server.gameManager.handleRoomList(testSockets[0], { id: '123' }, callback);

            // Assertion
            expect(callback).toHaveBeenCalledWith({ rooms: [] });
        });

        it('should handle room list and return filtered list with matching rooms', () => {
            // Setup
            const roomId = 'room-with-matching-id';
            server.gameManager.handleRoomCreate(testSockets[1], { id: roomId, mode: 'Standard' }, jest.fn());
            const callback = jest.fn();

            // Execution
            server.gameManager.handleRoomList(testSockets[0], { id: roomId.substring(0, 5) }, callback);

            // Assertion
            expect(callback).toHaveBeenCalledWith({ rooms: [{ id: roomId, mode: 'Standard' }] });
        });

        it('should handle room list and return all rooms if no id is provided', () => {
            // Setup
            const roomId1 = 'room-1';
            const roomId2 = 'room-2';
            server.gameManager.handleRoomCreate(testSockets[0], { id: roomId1, mode: 'Standard' }, jest.fn());
            server.gameManager.handleRoomCreate(testSockets[1], { id: roomId2, mode: 'Standard' }, jest.fn());
            const callback = jest.fn();

            // Execution
            server.gameManager.handleRoomList(testSockets[0], {}, callback);

            // Assertion
            expect(callback).toHaveBeenCalledWith({
                rooms: [
                    { id: roomId1, mode: server.gameManager.rooms[roomId1].mode },
                    { id: roomId2, mode: server.gameManager.rooms[roomId2].mode },
                ]
            });
        });
    })
};

module.exports = runRoomListTests;
