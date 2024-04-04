const Server = require('../Server');
const Player = require('../Player');
const generateNewConnections = require('./Help');

const runPlayerRenameTests = () => {
    describe('handlePlayerRename', () => {
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
            server.gameManager.players.forEach(player => {
                Object.assign(player, new Player(player.id, null));
            });
            jest.clearAllMocks();
        });

        test('should not handle player rename if socket is not an object', () => {
            const mockCallback = jest.fn();
            server.gameManager.handlePlayerRename(null, { name: 'newName' }, mockCallback);
            expect(mockCallback).not.toHaveBeenCalled();
        });

        test('should not handle player rename if payload is not an object or empty', () => {
            const mockCallback = jest.fn();
            server.gameManager.handlePlayerRename(testSockets[0], null, mockCallback);
            server.gameManager.handlePlayerRename(testSockets[0], {}, mockCallback);
            expect(mockCallback).not.toHaveBeenCalled();
        });

        test('should not handle player rename if callback is not a function', () => {
            const newName = 'newName';
            const mockCallback = jest.fn();
            server.gameManager.handlePlayerRename(testSockets[0], { name: newName }, null);
            expect(mockCallback).not.toHaveBeenCalled();
        });

        test('should not handle player rename if player does not exist', () => {
            const nonExistentSocket = { id: 'nonExistentPlayerId' };
            const mockCallback = jest.fn();
            server.gameManager.handlePlayerRename(nonExistentSocket, { name: 'newName' }, mockCallback);
            expect(mockCallback).not.toHaveBeenCalled();
        });

        test('should not handle player rename if name is invalid', () => {
            const mockCallback = jest.fn();

            server.gameManager.handlePlayerRename(testSockets[0], { name: 'a' }, mockCallback);
            expect(mockCallback).toHaveBeenCalledWith({ error: 'Name must be between 3 and 16 characters long.' });

            server.gameManager.handlePlayerRename(testSockets[0], { name: 'verylongnameofmorethan16characters' }, mockCallback);
            expect(mockCallback).toHaveBeenCalledWith({ error: 'Name must be between 3 and 16 characters long.' });

            server.gameManager.handlePlayerRename(testSockets[0], { name: 'Invalid#Name' }, mockCallback);
            expect(mockCallback).toHaveBeenCalledWith({ error: 'Name can only contain alphabets (uppercase or lowercase) and numbers.' });
        });

        test('should not handle player rename if name is already in use', () => {
            const mockCallback = jest.fn();
            server.gameManager.players[1].name = 'existingName';

            server.gameManager.handlePlayerRename(testSockets[0], { name: 'existingName' }, mockCallback);
            expect(mockCallback).toHaveBeenCalledWith({ error: 'The name "existingName" is already in use by another player' });
        });

        test('should handle player rename', () => {
            const mockCallback = jest.fn();
            const newName = 'newName';

            server.gameManager.handlePlayerRename(testSockets[0], { name: newName }, mockCallback);
            expect(mockCallback).toHaveBeenCalledWith({ name: newName });
        });


    })
};

module.exports = runPlayerRenameTests;