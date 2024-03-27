const request = require('supertest');
const Server = require('./Server');
const Room = require('./Room');
const Player = require('./Player');
const Piece = require('./Piece');
const Position = require('./Position');

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

    describe('Room', () => {
        let room;
        const host = 'hostPlayerId';
        const mode = 'Standard';

        beforeEach(() => {
            room = new Room(host, mode);
        });

        test('constructor should initialize with host and mode', () => {
            expect(room.host).toBe(host);
            expect(room.mode).toBe(mode);
        });

        test('should have host as the first player', () => {
            expect(room.players).toEqual([host]);
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

    describe('Piece', () => {
        let piece;

        beforeEach(() => {
            piece = new Piece();
        });

        test('constructor should initialize a random shape', () => {
            expect(piece.shape).toBeDefined();
        });

        test('rotatePieceLeft should rotate the piece left', () => {
            const originalShape = JSON.stringify(piece.shape);
            piece.rotatePieceLeft();
            const rotatedShape = JSON.stringify(piece.shape);

            if (originalShape === JSON.stringify([[1, 1], [1, 1]])) {
                expect(rotatedShape).toEqual(originalShape);
            } else {
                expect(rotatedShape).not.toEqual(originalShape);
            }
        });

        test('rotatePieceRight should rotate the piece right', () => {
            const originalShape = JSON.stringify(piece.shape);
            piece.rotatePieceRight();
            const rotatedShape = JSON.stringify(piece.shape);

            if (originalShape === JSON.stringify([[1, 1], [1, 1]])) {
                expect(rotatedShape).toEqual(originalShape);
            } else {
                expect(rotatedShape).not.toEqual(originalShape);
            }
        });

    });

    describe('Position', () => {
        test('constructor should initialize a position', () => {
            const shape = [
                [1, 1],
                [1, 1]
            ];
            const position = new Position(shape);
            expect(position.row).toBe(-2);
            expect(position.col).toBeGreaterThanOrEqual(0);
            expect(position.col).toBeLessThanOrEqual(9);
        });
    });

    describe('Player', () => {
        let player;

        beforeEach(() => {
            player = new Player('testPlayerId');
            player.grid = Array.from({ length: 20 }, () => Array(10).fill(0));
        });

        test('constructor should initialize a player', () => {
            expect(player.id).toBe('testPlayerId');
            expect(player.name).toBe('testPlayerId');
            expect(player.roomId).toBeNull();
            expect(player.grid.length).toBe(20);
            expect(player.grid[0].length).toBe(10);
            expect(player.currentPiece).toBeNull();
            expect(player.currentPosition).toBeNull();
            expect(player.nextPiece).toBeNull();
            expect(player.holdPiece).toBeNull();
            expect(player.hold).toBe(0);
            expect(player.penalty).toBe(0);
            expect(player.game).toBe(false);
            expect(player.score).toBe(0);
            expect(player.resetInterval.interval).toBeNull();
        });

        test('isPieceCanMove should return true if piece can move', () => {
            player.currentPiece = { shape: [[0, 1], [0, 1]] };
            player.currentPosition = { row: 0, col: 0 };
            expect(player.isPieceCanMove()).toBe(true);
        });

        test('isPieceCanMove should return false if piece cannot move due to grid boundary', () => {
            player.currentPiece = { shape: [[1, 1], [1, 1]] };
            player.currentPosition = { row: 19, col: 8 };
            expect(player.isPieceCanMove()).toBe(false);
        });

        test('isPieceCanMove should return false if piece cannot move due to collision', () => {
            player.currentPiece = { shape: [[1, 1], [1, 1]] };
            player.currentPosition = { row: 0, col: 0 };
            player.grid[1][0] = 1;
            expect(player.isPieceCanMove()).toBe(false);
        });

        test('addPenalty should add penalty rows to the grid', () => {
            player.penalty = 2;
            player.grid = [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ];
            player.addPenalty();
            expect(player.grid.length).toBe(5);
            expect(player.grid[4].every(cell => cell === -1)).toBe(true);
            expect(player.grid[4].filter(cell => cell === -1).length).toBe(10);
            expect(player.grid[3].every(cell => cell === -1)).toBe(true);
            expect(player.grid[3].filter(cell => cell === -1).length).toBe(10);
        });

        test('addPieceToGrid should add current piece to the grid', () => {
            player.currentPiece = { shape: [[1, 1], [1, 1]] };
            player.currentPosition = { row: 0, col: 0 };
            player.addPieceToGrid();
            expect(player.grid[0][0]).toBe(1);
            expect(player.grid[0][1]).toBe(1);
            expect(player.grid[1][0]).toBe(1);
            expect(player.grid[1][1]).toBe(1);
        });

        test('removeCompletedLines should remove completed lines from the grid and return number of lines removed', () => {
            player.grid = [
                [0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ];
            const linesRemoved = player.removeCompletedLines();
            expect(linesRemoved).toBe(3);
            expect(player.grid.length).toBe(5);
            expect(player.grid[0].every(cell => cell === 0)).toBe(true);
            expect(player.grid[0].length).toBe(10);
            expect(player.grid[1].every(cell => cell === 0)).toBe(true);
            expect(player.grid[1].length).toBe(10);
            expect(player.grid[2].every(cell => cell === 0)).toBe(true);
            expect(player.grid[2].length).toBe(10);
            expect(player.grid[3].every(cell => cell === 0)).toBe(false);
            expect(player.grid[3].length).toBe(10);
            expect(player.grid[4].every(cell => cell === 0)).toBe(false);
            expect(player.grid[4].length).toBe(10);
        });

        test('calculateSpectrum should calculate the spectrum of the grid', () => {
            player.grid = [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
                [0, 1, 0, 1, 1, 1, 1, 0, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
                [0, 0, 0, 1, 0, 1, 0, 0, 0, 0]
            ];
            const spectrum = player.calculateSpectrum();
            expect(spectrum.length).toBe(20);
            expect(spectrum[15].filter(cell => cell === -2).length).toBe(2);
            expect(spectrum[16].filter(cell => cell === -2).length).toBe(7);
            expect(spectrum[17].filter(cell => cell === -2).length).toBe(9);
            expect(spectrum[18].filter(cell => cell === -2).length).toBe(9);
            expect(spectrum[19].filter(cell => cell === -2).length).toBe(9);
        });

        test('closeGame should reset player game-related attributes', () => {
            player.currentPiece = {};
            player.currentPosition = {};
            player.nextPiece = {};
            player.holdPiece = {};
            player.hold = 1;
            player.penalty = 2;
            player.game = true;
            player.score = 100;
            player.resetInterval.interval = setInterval(() => { }, 1000);
            player.closeGame();
            expect(player.currentPiece).toBeNull();
            expect(player.currentPosition).toBeNull();
            expect(player.nextPiece).toBeNull();
            expect(player.holdPiece).toBeNull();
            expect(player.hold).toBe(0);
            expect(player.penalty).toBe(0);
            expect(player.game).toBe(false);
            expect(player.score).toBe(0);
            expect(player.resetInterval.interval).not.toEqual(expect.any(Number));
        });

        test('isGameEnd should return true if grid top row has filled cells', () => {
            player.grid[0] = Array(10).fill(1);
            expect(player.isGameEnd()).toBe(true);
        });

        test('isGameEnd should return false if grid top row does not have filled cells', () => {
            player.grid[0] = Array(10).fill(0);
            expect(player.isGameEnd()).toBe(false);
        });
    });

    describe('GameManager', () => {

        const consoleSpy = jest.spyOn(console, 'log');

        describe('handleRoomCreate', () => {

            test('should return error if player is not found', () => {
                // Prepare test data
                const payload = { id: null, mode: 'Standard' };
                const cb = jest.fn();

                // Call the method under test with a socket without an associated player
                gameManager.handleRoomCreate({ id: 'nonexistentSocketId' }, payload, cb);

                // Check results
                expect(testSockets[0].join).not.toHaveBeenCalled();
                expect(testSockets[0].emit).not.toHaveBeenCalled();
                expect(Object.keys(gameManager.rooms).length).toBe(0);
                expect(consoleSpy).toHaveBeenCalled();
            });

            test('should return error if mode is invalid', () => {
                // Prepare test data
                const payload = { id: null, mode: 'InvalidMode' };
                const cb = jest.fn();

                // Call the method under test
                gameManager.handleRoomCreate(testSockets[0], payload, cb);

                // Check results
                expect(testSockets[0].join).not.toHaveBeenCalled();
                expect(testSockets[0].emit).not.toHaveBeenCalled();
                expect(Object.keys(gameManager.rooms).length).toBe(0);
                expect(consoleSpy).toHaveBeenCalled();
            });

            test('should return error if player is already in a room', () => {
                // Prepare test data
                const payload = { id: null, mode: 'Standard' };
                const cb = jest.fn();

                // Simulate necessary situation
                gameManager.rooms['fakeRoomId'] = new Room('somePlayerId', 'Standard');
                gameManager.players[0].roomId = "fakeRoomId";

                // Call the method under test
                gameManager.handleRoomCreate(testSockets[0], payload, cb);

                // Check results
                expect(testSockets[0].join).not.toHaveBeenCalled();
                expect(testSockets[0].emit).not.toHaveBeenCalled();
                expect(Object.keys(gameManager.rooms).length).toBe(1);
                expect(consoleSpy).toHaveBeenCalled();

                // Clean up modifications
                gameManager.rooms = {};
                gameManager.players[0].roomId = null;
            });

            test('should create a new room with valid payload', () => {
                // Prepare test data
                const payload = { id: null, mode: 'Standard' };
                const cb = jest.fn();

                // Call the method under test
                gameManager.handleRoomCreate(testSockets[0], payload, cb);

                // Check results
                expect(testSockets[0].join).toHaveBeenCalled();
                expect(testSockets[0].emit).toHaveBeenCalledWith('tetris:room:joined', expect.any(Object));
                expect(testSockets[0].emit).toHaveBeenCalledWith('tetris:room:updated', expect.any(Object));
                expect(consoleSpy).toHaveBeenCalled();

                // Clean up modifications
                gameManager.rooms = {};
                gameManager.players[0].roomId = null;
            });
        });

        describe('handleRoomJoin', () => {

            test('should return error if player is not found', () => {
                // Prepare test data
                const payload = { id: 'someRoomId' };
                const cb = jest.fn();

                // Call the method under test with a socket without an associated player
                gameManager.handleRoomJoin({ id: 'nonexistentSocketId' }, payload, cb);

                // Check results
                expect(cb).not.toHaveBeenCalled();
                expect(consoleSpy).toHaveBeenCalled();
            });

            test('should return error if room ID is required', () => {
                // Prepare test data
                const payload = {};
                const cb = jest.fn();

                // Call the method under test
                gameManager.handleRoomJoin(testSockets[0], payload, cb);

                // Check results
                expect(cb).toHaveBeenCalledWith({ error: 'Room ID is required' });
                expect(consoleSpy).toHaveBeenCalled();
            });

            test('should call handleRoomLeave if player is already in a room', () => {
                // Prepare test data
                const roomId = 'existingRoomId';
                const payload = { id: roomId };
                const cb = jest.fn();
                const handleRoomLeaveSpy = jest.spyOn(gameManager, 'handleRoomLeave').mockImplementation(() => {});
                gameManager.players[0].roomId = roomId;
            
                // Call the method under test
                gameManager.handleRoomJoin(testSockets[0], payload, cb);
            
                // Check results
                expect(handleRoomLeaveSpy).toHaveBeenCalledWith(testSockets[0], cb);
                expect(consoleSpy).toHaveBeenCalled();
            
                // Clean up modifications
                handleRoomLeaveSpy.mockRestore();
                gameManager.players[0].roomId = null;
            });
            

            test('should return error if room is full', () => {
                // Prepare test data
                const roomId = 'existingRoomId';
                const payload = { id: roomId };
                const cb = jest.fn();
                gameManager.rooms[roomId] = new Room('hostPlayerId', 'Standard');
                for (let i = 0; i < 9; i++) {
                    gameManager.rooms[roomId].addPlayer(`player${i}`);
                }

                // Call the method under test
                gameManager.handleRoomJoin(testSockets[0], payload, cb);

                // Check results
                expect(cb).toHaveBeenCalledWith({ error: 'Room is full' });
                expect(consoleSpy).toHaveBeenCalled();

                // Clean up modifications
                gameManager.rooms = {};
            });

            test('should return error if room is currently playing', () => {
                // Prepare test data
                const roomId = 'existingRoomId';
                const payload = { id: roomId };
                const cb = jest.fn();
                gameManager.rooms[roomId] = new Room('hostPlayerId', 'Standard');
                gameManager.rooms[roomId].start = true;

                // Call the method under test
                gameManager.handleRoomJoin(testSockets[0], payload, cb);

                // Check results
                expect(cb).toHaveBeenCalledWith({ error: 'Room is currently playing' });
                expect(consoleSpy).toHaveBeenCalled();

                // Clean up modifications
                gameManager.rooms = {};
            });

            test('should call handleRoomCreate if room does not exist', () => {
                // Prepare test data
                const roomId = 'nonexistentRoomId';
                const payload = { id: roomId };
                const cb = jest.fn();
                const handleRoomCreateSpy = jest.spyOn(gameManager, 'handleRoomCreate').mockImplementation(() => { });

                // Call the method under test
                gameManager.handleRoomJoin(testSockets[0], payload, cb);

                // Check results
                expect(handleRoomCreateSpy).toHaveBeenCalledWith(testSockets[0], { id: roomId, mode: 'Standard' }, cb);
                expect(consoleSpy).toHaveBeenCalled();

                // Clean up modifications
                handleRoomCreateSpy.mockRestore();
            });

            test('should successfully join an existing room', () => {
                // Prepare test data
                const roomId = 'existingRoomId';
                const payload = { id: roomId };
                const cb = jest.fn();
                const player = gameManager.players[0];
                gameManager.rooms[roomId] = new Room('hostPlayerId', 'Standard');

                // Call the method under test
                gameManager.handleRoomJoin(testSockets[0], payload, cb);

                // Check results
                expect(cb).toHaveBeenCalledWith({ error: null });
                expect(player.roomId).toBe(roomId);
                expect(testSockets[0].join).toHaveBeenCalledWith(roomId);
                expect(testSockets[0].emit).toHaveBeenCalledWith('tetris:room:joined', expect.any(Object));
                expect(gameManager.io.to).toHaveBeenCalledWith(roomId);
                expect(testSockets[0].emit).toHaveBeenCalledWith('tetris:room:updated', expect.any(Object));
                expect(consoleSpy).toHaveBeenCalled();

                // Clean up modifications
                player.roomId = null;
                gameManager.rooms = {};
            });
        });


    });

});
