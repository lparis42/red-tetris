const request = require('supertest');
const Server = require('./Server');
const Room = require('./Room');
const Player = require('./Player');

describe('server', () => {
    let server;
    
    describe('GET /', () => {
        it('should return index.html', async () => {
            const res = await request(server.app).get('/');
            expect(res.status).toBe(200);
            expect(res.text).toContain('<!doctype html>');
        });
    });

    let gameManager;
    let testSockets = [];

    const consoleSpy = jest.spyOn(console, 'log');

    function generateNewConnections(numConnections) {
        const newSockets = [];
        for (let i = 0; i < numConnections; i++) {
            const randomId = Math.random().toString(36).substring(7); // Générer un identifiant aléatoire
            const socket = { id: randomId, join: jest.fn(), emit: jest.fn() }; // Créer un nouvel objet socket avec l'identifiant aléatoire
            server.io.emit('connection', socket); // Émettre un événement de connexion avec le nouvel objet socket
            gameManager.players.push(new Player(socket.id)); // Ajouter le nouveau joueur à la liste des joueurs
            newSockets.push(socket); // Ajouter le nouvel objet socket à la liste des nouvelles connexions
        }
        return newSockets; // Retourner la liste des nouveaux objets socket
    }

    beforeAll(() => {
        server = new Server();
        gameManager = server.gameManager;

        testSockets = generateNewConnections(2);
    });

    afterAll(done => {
        server.closeServer(done);
    });

    describe('GameManager', () => {

        test('handleRoomCreate should return error if player is not found', () => {
            // Préparer les données de test
            const payload = { id: null, mode: 'Standard' };
            const cb = jest.fn();

            // Appeler la méthode à tester avec un socket sans joueur associé
            gameManager.handleRoomCreate({ id: 'nonexistentSocketId' }, payload, cb);

            // Vérifier les résultats
            expect(cb).toHaveBeenCalledWith(null, { error: 'Player not found' });
            expect(testSockets[0].join).not.toHaveBeenCalled();
            expect(testSockets[0].emit).not.toHaveBeenCalled();
            expect(Object.keys(gameManager.rooms).length).toBe(0);
            expect(consoleSpy).toHaveBeenCalled();
        });

        test('handleRoomCreate should return error if mode is invalid', () => {
            // Préparer les données de test
            const payload = { id: null, mode: 'InvalidMode' };
            const cb = jest.fn();

            // Appeler la méthode à tester
            gameManager.handleRoomCreate(testSockets[0], payload, cb);

            // Vérifier les résultats
            expect(cb).toHaveBeenCalledWith(null, { error: 'Invalid room mode' });
            expect(testSockets[0].join).not.toHaveBeenCalled();
            expect(testSockets[0].emit).not.toHaveBeenCalled();
            expect(Object.keys(gameManager.rooms).length).toBe(0);
            expect(consoleSpy).toHaveBeenCalled();
        });

        test('handleRoomCreate should return error if player is already in a room', () => {
            // Préparer les données de test
            const payload = { id: null, mode: 'Standard' };
            const cb = jest.fn();

            // Simuler la situation nécessaire
            gameManager.rooms['fakeRoomId'] = new Room('somePlayerId', 'Standard');
            gameManager.players[0].roomId = "fakeRoomId";

            // Appeler la méthode à tester
            gameManager.handleRoomCreate(testSockets[0], payload, cb);

            // Vérifier les résultats
            expect(cb).toHaveBeenCalledWith(null, { error: 'You are already in a room' });
            expect(testSockets[0].join).not.toHaveBeenCalled();
            expect(testSockets[0].emit).not.toHaveBeenCalled();
            expect(Object.keys(gameManager.rooms).length).toBe(1);
            expect(consoleSpy).toHaveBeenCalled();

            // Retirer les modifications
            gameManager.rooms = {};
            gameManager.players[0].roomId = null;
        });

        test('handleRoomCreate should create a new room with valid payload', () => {
            // Préparer les données de test
            const payload = { id: null, mode: 'Standard' };
            const cb = jest.fn();

            // Appeler la méthode à tester
            gameManager.handleRoomCreate(testSockets[0], payload, cb);

            // Vérifier les résultats
            expect(cb).toHaveBeenCalledWith(null, { error: null });
            expect(testSockets[0].join).toHaveBeenCalled();
            expect(testSockets[0].emit).toHaveBeenCalledWith('tetris:room:joined', expect.any(Object));
            expect(testSockets[0].emit).toHaveBeenCalledWith('tetris:room:updated', expect.any(Object));
            expect(consoleSpy).toHaveBeenCalled();

            // Retirer les modifications
            gameManager.rooms = {};
            gameManager.players[0].roomId = null;
        });
    });

});
