const Server = require('../Server');
const Player = require('../Player');
const generateNewConnections = require('./Help');

const runRoomKickTests = () => {
    describe('handleRoomKick', () => {
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

        it('should not handle room kick if socket is invalid', () => {
            const handleHostKick = jest.spyOn(server.gameManager, 'handleHostKick');
            const handlePlayerKick = jest.spyOn(server.gameManager, 'handlePlayerKick');

            // Execution
            server.gameManager.handleRoomKick(null, { name: 'test' });

            // Assertion
            expect(handleHostKick).not.toHaveBeenCalled();
            expect(handlePlayerKick).not.toHaveBeenCalled();
        });

        it('should not handle room kick if payload is missing or invalid', () => {
            const handleHostKick = jest.spyOn(server.gameManager, 'handleHostKick');
            const handlePlayerKick = jest.spyOn(server.gameManager, 'handlePlayerKick');

            // Execution
            server.gameManager.handleRoomKick(testSockets[0], null);
            server.gameManager.handleRoomKick(testSockets[0], {});
            server.gameManager.handleRoomKick(testSockets[0], { name: '' });

            // Assertion
            expect(handleHostKick).not.toHaveBeenCalled();
            expect(handlePlayerKick).not.toHaveBeenCalled();
        });

        it('should not handle room kick if player name is missing', () => {
            const handleHostKick = jest.spyOn(server.gameManager, 'handleHostKick');
            const handlePlayerKick = jest.spyOn(server.gameManager, 'handlePlayerKick');

            // Execution
            server.gameManager.handleRoomKick(testSockets[0], { name: undefined });

            // Assertion
            expect(handleHostKick).not.toHaveBeenCalled();
            expect(handlePlayerKick).not.toHaveBeenCalled();
        });

        it('should not handle room kick if player is not found', () => {
            const handleHostKick = jest.spyOn(server.gameManager, 'handleHostKick');
            const handlePlayerKick = jest.spyOn(server.gameManager, 'handlePlayerKick');

            // Execution
            server.gameManager.handleRoomKick(testSockets[0], { name: 'non-existent' });

            // Assertion
            expect(handleHostKick).not.toHaveBeenCalled();
            expect(handlePlayerKick).not.toHaveBeenCalled();
        });

        it('should not handle room kick if player is not in a room', () => {
            // Setup
            server.gameManager.players[0].roomId = null;

            const handleHostKick = jest.spyOn(server.gameManager, 'handleHostKick');
            const handlePlayerKick = jest.spyOn(server.gameManager, 'handlePlayerKick');

            // Execution
            server.gameManager.handleRoomKick(testSockets[0], { name: 'name1' });

            // Assertion
            expect(handleHostKick).not.toHaveBeenCalled();
            expect(handlePlayerKick).not.toHaveBeenCalled();
        });

        it('should handle room kick for a non-leader player', () => {
            // Setup
            const roomId = 'room0';
            server.gameManager.handleRoomCreate(testSockets[0], { id: roomId, mode: 'Standard' }, jest.fn());
            server.gameManager.handleRoomJoin(testSockets[1], { id: roomId }, jest.fn());

            const handlePlayerKick = jest.spyOn(server.gameManager, 'handlePlayerKick');
            const handleHostKick = jest.spyOn(server.gameManager, 'handleHostKick');
            const ioTo = jest.spyOn(server.gameManager.io, 'to').mockReturnValue({ emit: jest.fn() });

            // Execution
            server.gameManager.handleRoomKick(testSockets[0], { name: server.gameManager.players[1].name });

            // Assertion
            expect(handlePlayerKick).toHaveBeenCalled();
            expect(handleHostKick).not.toHaveBeenCalled();
            expect(testSockets[1].emit).toHaveBeenCalledWith('tetris:room:leave');
            expect(ioTo).toHaveBeenCalledWith(roomId);
        });

        it('should handle room kick for the leader player', () => {
            // Setup
            const roomId = 'room0';
            server.gameManager.handleRoomCreate(testSockets[0], { id: roomId, mode: 'Standard' }, jest.fn());
            server.gameManager.handleRoomJoin(testSockets[1], { id: roomId }, jest.fn());

            const handlePlayerKick = jest.spyOn(server.gameManager, 'handlePlayerKick');
            const handleHostKick = jest.spyOn(server.gameManager, 'handleHostKick');
            const ioTo = jest.spyOn(server.gameManager.io, 'to').mockReturnValue({ emit: jest.fn() });

            // Execution
            server.gameManager.handleRoomKick(testSockets[0], { name: server.gameManager.players[0].name });

            // Assertion
            expect(handlePlayerKick).toHaveBeenCalled();
            expect(handleHostKick).toHaveBeenCalled();
            expect(ioTo).toHaveBeenCalledWith(roomId);
        });
    });
};

module.exports = runRoomKickTests;
