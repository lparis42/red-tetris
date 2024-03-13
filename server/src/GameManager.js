// GameManager.js
const Player = require('./Player');
const Room = require('./Room');
const Piece = require('./Piece');
const Position = require('./Position');

const ROWS = 20;
const COLS = 10;

class GameManager {
    constructor(io) {
        this.io = io;
        this.players = [];
        this.rooms = {};
        this.setupSocketHandlers();
    }

    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`${socket.id} connected`);
            this.players.push(new Player(socket.id));

            socket.on('tetris:room:create', (mode, cb) => this.handleRoomCreate(socket, mode, cb));
            socket.on('tetris:room:join', (roomId, cb) => this.handleRoomJoin(socket, roomId, cb));
            socket.on('tetris:room:leave', (cb) => this.handleRoomLeave(socket, cb));
            socket.on('tetris:room:game:start', (cb) => this.handleRoomGameStart(socket, cb));
            socket.on('tetris:room:game:action', (action, cb) => this.handleRoomGameAction(socket, action, cb));
            socket.on('tetris:player:rename', (newName, cb) => this.handlePlayerRename(socket, newName, cb));
            socket.on('tetris:room:list', (roomId, cb) => this.handleRoomList(socket, roomId, cb));
            socket.on('tetris:room:kick', (playerId, cb) => this.handleRoomKick(socket, playerId, cb));

            socket.on('disconnect', () => this.handleDisconnect(socket));
        });
    }

    checkCondition(condition, data, errorMessage, socket, cb) {
        if (condition) {
            cb(data, errorMessage);
            console.error(`${socket.id} : ${errorMessage}`);
            return true;
        }
        return false;
    }

    handleRoomCreate(socket, mode, cb) {

        // Vérifier si le joueur existe
        const player = this.players.find(player => player.id === socket.id);
        if (this.checkCondition(!player, null, 'Player not found', socket, cb)) return;

        // Vérifier si le joueur est déjà dans une salle
        if (this.checkCondition(player.roomId !== null, null, 'You are already in a room', socket, cb)) return;

        // Vérifier si le mode est valide (STANDARD ou EXPERT)
        if (this.checkCondition(mode !== 'STANDARD' && mode !== 'EXPERT', null, 'Invalid room mode', socket, cb)) return;

        // Logique pour générer un identifiant de room aléatoire et unique
        let roomId;
        do {
            roomId = Array.from({ length: 6 }, () => Math.random().toString(36).charAt(2)).join('');
        } while (this.rooms[roomId]);

        const room = new Room(socket.id, mode);
        this.rooms[roomId] = room;
        player.roomId = roomId;

        socket.join(roomId);
        cb(roomId, null);

        console.log(`${socket.id} created room ${roomId}`);
    }

    handleRoomJoin(socket, roomId, cb) {

        // Vérifier si l'ID de la salle est spécifié
        if (this.checkCondition(!roomId, roomId, 'Room ID is required', socket, cb)) return;

        // Vérifier si le joueur existe
        const player = this.players.find(player => player.id === socket.id);
        if (this.checkCondition(!player, roomId, 'Player not found', socket, cb)) return;

        // Vérifier si la salle existe
        const room = this.rooms[roomId];
        if (this.checkCondition(!room, roomId, `Room not found with ID: ${roomId}`, socket, cb)) return;

        // Vérifier si la salle est pleine (max 9 joueurs)
        if (this.checkCondition(room.players.length >= 9, roomId, 'Room is full', socket, cb)) return;

        // Vérifier si le joueur est déjà dans une salle
        if (this.checkCondition(player.roomId !== null, roomId, 'Player is already in a room', socket, cb)) return;

        room.addPlayer(player.id, player.name);
        player.roomId = roomId;

        socket.join(roomId);
        cb(roomId, null);

        const playerNames = room.players.map(playerId => this.players.find(p => p.id === playerId).name);
        this.io.to(roomId).emit('tetris:room:update', playerNames);

        console.log(`${socket.id} joined room ${roomId}`);
    }

    handleRoomLeave(socket, cb) {
        // Vérifier si le joueur existe
        const player = this.players.find(player => player.id === socket.id);
        if (this.checkCondition(!player, player.name, `Player not found`, socket, cb)) return;
    
        // Vérifier si le joueur est dans une salle
        if (this.checkCondition(!player.roomId, player.name, `You are not in any room`, socket, cb)) return;
    
        // Vérifier si la salle existe
        const room = this.rooms[player.roomId];
        if (this.checkCondition(!room, player.name, `Room ${player.roomId} does not exist`, socket, cb)) return;
    
        const index = room.players.indexOf(socket.id);
    
        // Vérifier si le joueur est dans la salle
        if (this.checkCondition(index === -1, player.name, `You are not in room ${player.roomId}`, socket, cb)) return;
    
        if (socket.id === room.host) {
            // Sélectionner un nouveau host parmi les joueurs restants
            const remainingPlayers = room.players.filter(playerId => playerId !== socket.id);
            if (remainingPlayers.length > 0) {
                const newHostId = remainingPlayers[0]; // Prendre le premier joueur restant comme nouveau host
                room.host = newHostId;
                const newHostPlayer = this.players.find(player => player.id === newHostId);
                if (newHostPlayer) {
                    newHostPlayer.isHost = true;
                } else {
                    console.error(`New host player ${newHostId} not found.`);
                }
            } else {
                // S'il n'y a plus personne dans la salle, supprimer la salle
                delete this.rooms[player.roomId];
                console.log(`Room ${player.roomId} closed.`);
            }
        } else {
            // Retirer le joueur de la salle
            socket.leave(player.roomId);
            room.removePlayer(socket.id);
            // Mettre à jour les noms des joueurs dans la salle pour les clients
            const playerNames = room.players.map(playerId => this.players.find(p => p.id === playerId).name);
            this.io.to(player.roomId).emit('tetris:room:update', playerNames);
            // Appeler le callback pour notifier que le joueur a quitté la salle
            cb(player.name, null);
            console.log(`${socket.id} left room ${player.roomId}`);
        }
    
        player.roomId = null;
    }
    
    updateIntervalFall(playerSocket, player, room, level, timer) {

        player.removePieceToGrid();
        player.addPenalty();
        player.currentPosition.row += 1;

        // Vérifier si la pièce peut bouger vers le bas
        if (!player.isPieceCanMove()) {

            player.currentPosition.row -= 1;
            player.addPieceToGrid();

            // Vérifier et supprimer les lignes complétées
            const penalty = player.removeCompletedLines();
            if (penalty > 1) {
                const playersInRoom = this.players.filter(otherPlayer => room.players.includes(otherPlayer.id) && otherPlayer.id !== player.id);
                playersInRoom.forEach(otherPlayer => {
                    otherPlayer.penalty += penalty - 1;
                });
            }

            // Vérifier si la première ligne est remplie
            if (player.isGameEnd()) {
                playerSocket.emit('tetris:room:game:end');
                return;
            }

            level += 1;
            if (!room.pieces[level]) {
                const piece = new Piece();
                const position = new Position(piece.shape);
                room.addPiece(piece, position);
            }
            if (!room.pieces[level + 1]) {
                const piece = new Piece();
                const position = new Position(piece.shape);
                room.addPiece(piece, position);
            }
            player.currentPiece = Object.create(room.pieces[level]);
            player.currentPosition = Object.create(room.positions[level]);
            player.nextPiece = Object.create(room.pieces[level + 1]);

            if (level >= 0 && level <= 9) {
                timer = 800;
            } else if (level >= 10 && level <= 19) {
                timer = 700;
            } else if (level >= 20 && level <= 29) {
                timer = 600;
            } else if (level >= 30 && level <= 39) {
                timer = 500;
            } else if (level >= 40 && level <= 49) {
                timer = 400;
            }
            player.resetInterval.clear();
            player.resetInterval.set(() => {
                this.updateIntervalFall(playerSocket, player, room, level, timer);
            }, timer);
        }

        player.addPieceToGrid();

        const playerGrid = {
            piece: {
                current: {
                    position: player.currentPosition,
                    content: player.currentPiece
                },
                next: { content: player.nextPiece },
                hold: { content: player.holdPiece ? player.holdPiece : null }
            },
            content: player.grid
        };
        socket.emit('tetris:room:game:update:grid', playerGrid);

        const spectreToUpdate = player.calculateSpectrum();
        socket.broadcast.to(player.roomId).emit('tetris:room:game:update:spectre', player.name, spectreToUpdate);
    };

    // Fonction pour démarrer le jeu
    handleRoomGameStart(socket, cb) {

        // Vérifier si le joueur existe
        const player = this.players.find(player => player.id === socket.id);
        if (this.checkCondition(!player, `Player not found`, socket, cb)) return;

        // Vérifier si le joueur est dans une salle
        if (this.checkCondition(!player.roomId, `You are not in any room`, socket, cb)) return;

        // Vérifier si la salle existe
        if (this.checkCondition(!this.rooms[player.roomId], `Room does not exist`, socket, cb)) return;

        const room = this.rooms[player.roomId];

        // Vérifier si le joueur est dans la salle
        const index = room.players.indexOf(socket.id);
        if (this.checkCondition(index === -1, `You are not in the room`, socket, cb)) return;

        // Vérifier si le jeu a déjà commencé dans la salle
        if (this.checkCondition(player.isGameStart, `Game already started`, socket, cb)) return;

        const piece = new Piece();
        const position = new Position(piece.shape);
        room.addPiece(piece, position);

        const roomPlayers = this.players.filter(player => room.players.includes(player.id));

        roomPlayers.forEach(player => {
            player.isGameStart = true;
            player.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
            player.currentPiece = Object.create(room.pieces[0]);
            player.currentPosition = Object.create(room.positions[0]);
            player.addPieceToGrid();

            player.resetInterval.set(() => {
                const playerSocket = this.io.sockets.sockets.get(player.id);
                this.updateIntervalFall(playerSocket, player, room, 0, 800);
            }, 800);
        });

        const playerGrid = {
            piece: {
                current: {
                    position: player.currentPosition,
                    content: player.currentPiece
                },
                next: { content: player.nextPiece },
                hold: { content: player.holdPiece ? player.holdPiece : null }
            },
            content: player.grid
        };
        socket.emit('tetris:room:game:update:grid', playerGrid);

        const spectreToUpdate = player.calculateSpectrum();
        socket.broadcast.to(player.roomId).emit('tetris:room:game:update:spectre', player.name, spectreToUpdate);

        this.io.to(player.roomId).emit("tetris:room:game:start", null);

        console.log(`Game started in room ${player.roomId}`);
    }


    handleRoomGameAction(socket, action, cb) {

        // Vérifier si l'action est valide
        if (this.checkCondition(!['move-left', 'move-right', 'move-down', 'move-space', 'rotate-left', 'rotate-right'].includes(action), `Invalid action`, socket, cb)) return;

        // Vérifier si le joueur existe et est dans une salle
        const player = this.players.find(player => player.id === socket.id && player.roomId);
        if (this.checkCondition(!player, `Player not found`, socket, cb)) return;

        // Vérifier si la salle existe
        const room = this.rooms[player.roomId];
        if (this.checkCondition(!room, `Room not found`, socket, cb)) return;

        // Vérifier si le joueur est dans la salle
        if (this.checkCondition(!room.players.includes(player.id), `Player is not in the room ${room.id}`, socket, cb)) return;

        // Vérifier si le jeu a commencé
        if (this.checkCondition(!player.isGameStart, `Game has not started yet`, socket, cb)) return;


        // Appliquer l'action du joueur
        switch (action) {
            case 'move-left':
                player.removePieceToGrid();
                player.currentPosition.col -= 1;
                if (!player.isPieceCanMove()) {
                    player.currentPosition.col += 1;
                }
                player.addPieceToGrid();
                break;
            case 'move-right':
                player.removePieceToGrid();
                player.currentPosition.col += 1;
                if (!player.isPieceCanMove()) {
                    player.currentPosition.col -= 1;
                }
                player.addPieceToGrid();
                break;
            case 'move-down':
                player.removePieceToGrid();
                player.currentPosition.row += 1;
                if (!player.isPieceCanMove()) {
                    player.currentPosition.row -= 1;
                }
                player.addPieceToGrid();
                break;
            case 'rotate-left':
                player.removePieceToGrid();
                player.currentPiece.rotatePieceLeft();
                if (!player.isPieceCanMove()) {
                    player.currentPiece.rotatePieceRight();
                }
                player.addPieceToGrid();
                break;
            case 'rotate-right':
                player.removePieceToGrid();
                player.currentPiece.rotatePieceRight();
                if (!player.isPieceCanMove()) {
                    player.currentPiece.rotatePieceLeft();
                }
                player.addPieceToGrid();
                break;
            case 'move-space':
                player.removePieceToGrid();
                // Logique pour déplacer instantanément la pièce vers le bas
                while (player.isPieceCanMove()) {
                    player.currentPosition.row += 1;
                }
                player.currentPosition.row -= 1;
                player.addPieceToGrid();
                break;
            default:
                break;
        }

        const playerGrid = {
            piece: {
                current: {
                    position: player.currentPosition,
                    content: player.currentPiece
                },
                next: { content: player.nextPiece },
                hold: { content: player.holdPiece ? player.holdPiece : null }
            },
            content: player.grid
        };
        socket.emit('tetris:room:game:update:grid', playerGrid);
    }

    handlePlayerRename(socket, newName, cb) {

        // Vérification si le joueur existe
        if (this.checkCondition(!this.players.find(player => player.id === socket.id), `Player not found.`, socket, cb)) return;

        // Vérification de la longueur du nouveau nom
        if (this.checkCondition(newName.length < 1 || newName.length > 8, `Name must be between 1 and 8 characters long.`, socket, cb)) return;

        // Vérification des caractères autorisés dans le nouveau nom
        const allowedCharacters = /^[a-zA-Z0-9]+$/;
        if (this.checkCondition(!allowedCharacters.test(newName), `Name can only contain alphabets (uppercase or lowercase) and numbers.`, socket, cb)) return;

        // Vérification de l'unicité du nouveau nom choisi
        if (this.checkCondition(this.players.some(p => p.name === newName), `The name "${newName}" is already in use by another player`, socket, cb)) return;

        player.name = newName;
        cb(newName, null);

        console.log(`${socket.id} has been renamed to ${newName}`);
    }

    handleRoomList(socket, roomId, cb) {

        // Vérifier si un préfixe est spécifié
        let filteredRooms = Object.values(this.rooms);
        if (roomId && roomId.trim() !== '') {
            filteredRooms = filteredRooms.filter(room => room.id.startsWith(roomId));
        }

        const roomList = filteredRooms.map(room => ({ id: room.id, mode: room.mode }));
        cb(roomList);

        console.log(`Room list sent to ${socket.id}`);
    }

    handleRoomKick(socket, playerId, cb) {
        // Vérification si playerId est vide
        if (this.checkCondition(!playerId, `Invalid playerId`, socket, cb)) return;

        // Vérification si le joueur n'est pas trouvé
        const player = this.players.find(player => player.id === socket.id);
        if (this.checkCondition(!player, `Player not found`, socket, cb)) return;

        // Vérification si le joueur n'est pas dans une salle
        if (this.checkCondition(!player.roomId, `Player is not in any room`, socket, cb)) return;

        // Vérification si la salle associée au joueur existe
        const room = this.rooms[player.roomId];
        if (this.checkCondition(!room, `Room ${player.roomId} not found`, socket, cb)) return;

        // Vérification si le joueur est l'hôte de la salle
        if (this.checkCondition(player.id !== room.host, `You are not the host of room ${player.roomId}`, socket, cb)) return;

        const playerIndex = room.players.indexOf(playerId);

        // Vérification si le joueur à expulser n'est pas dans la salle
        if (this.checkCondition(playerIndex === -1, `Player ${playerId} is not in room ${player.roomId}`, socket, cb)) return;

        if (playerId === room.host) {
            // Sélectionner un nouveau host parmi les joueurs restants
            const remainingPlayers = room.players.filter(playerId => playerId !== socket.id);
            if (remainingPlayers.length > 0) {
                const newHostId = remainingPlayers[0]; // Prendre le premier joueur restant comme nouveau host
                room.host = newHostId;
                const newHostPlayer = this.players.find(player => player.id === newHostId);
                if (newHostPlayer) {
                    newHostPlayer.isHost = true;
                } else {
                    console.error(`New host player ${newHostId} not found.`);
                }
            } else {
                // S'il n'y a plus personne dans la salle, supprimer la salle
                delete this.rooms[roomId];
                console.log(`Room ${roomId} closed.`);
            }
        } else {
            // Trouver le socket du joueur
            const playerSocket = this.io.sockets.sockets.get(playerId);
            if (this.checkCondition(!playerSocket, `Player to kick not found`, socket, cb)) return;
            // Retirer le joueur de la salle
            playerSocket.leave(player.roomId);
            // Envoyer un message de départ au joueur expulsé
            playerSocket.emit('tetris:room:kick', playerId);
            // Retirer le joueur de la liste des joueurs de la salle
            room.players.splice(playerIndex, 1);
            // Mettre à jour les noms des joueurs dans la salle pour les clients
            const playerNames = room.players.map(playerId => this.players.find(p => p.id === playerId).name);
            this.io.to(roomId).emit('tetris:room:update', playerNames);
            // Mettre à jour la roomId du joueur expulsé
            this.players.find(p => p.id === playerId).roomId = null;

            console.log(`${playerId} kicked from room ${player.roomId}`);
        }
        cb(null);
    }

    handleDisconnect(socket) {
        // Vérifier si le joueur existe
        const player = this.players.find(player => player.id === socket.id);
        if (!player) {
            console.error(`Player with socket ID ${socket.id} not found.`);
            return;
        }

        // Vérifier si le joueur est dans une salle
        if (player.roomId) {
            const room = this.rooms[player.roomId];
            if (room) {
                if (socket.id === room.host) {
                    // Sélectionner un nouveau host parmi les joueurs restants
                    const remainingPlayers = room.players.filter(playerId => playerId !== socket.id);
                    if (remainingPlayers.length > 0) {
                        const newHostId = remainingPlayers[0]; // Prendre le premier joueur restant comme nouveau host
                        room.host = newHostId;
                        const newHostPlayer = this.players.find(player => player.id === newHostId);
                        if (newHostPlayer) {
                            newHostPlayer.isHost = true;
                        } else {
                            console.error(`New host player ${newHostId} not found.`);
                        }
                    } else {
                        // S'il n'y a plus personne dans la salle, supprimer la salle
                        delete this.rooms[roomId];
                        console.log(`Room ${roomId} closed.`);
                    }
                } else {
                    // Effacer l'intervalle de réinitialisation du joueur
                    player.resetInterval.clear();
                    // Retirer le joueur de la salle
                    socket.leave(player.roomId);
                    // Mettre à jour la liste des joueurs de la salle
                    room.players = room.players.filter(p => p !== socket.id);
                    // Mettre à jour les noms des joueurs dans la salle pour les clients
                    const playerNames = room.players.map(playerId => this.players.find(p => p.id === playerId).name);
                    this.io.to(roomId).emit('tetris:room:update', playerNames);

                    console.log(`${socket.id} left room ${player.roomId}`);
                }
            }
        }
        this.players.splice(this.players.findIndex(player => player.id === socket.id), 1);
        console.log(`${socket.id} disconnected`);
    }
}

module.exports = GameManager;
