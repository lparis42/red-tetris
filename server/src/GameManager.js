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

            socket.on('tetris:room:create', (payload, cb) => this.handleRoomCreate(socket, payload, cb));
            socket.on('tetris:room:join', (payload, cb) => this.handleRoomJoin(socket, payload, cb));
            socket.on('tetris:room:leave', (cb) => this.handleRoomLeave(socket, cb));
            socket.on('tetris:game:start', (cb) => this.handleRoomGameStart(socket, cb));
            socket.on('tetris:game:action', (payload, cb) => this.handleRoomGameAction(socket, payload, cb));
            socket.on('tetris:player:rename', (payload, cb) => this.handlePlayerRename(socket, payload, cb));
            socket.on('tetris:room:list', (payload, cb) => this.handleRoomList(socket, payload, cb));
            socket.on('tetris:room:kick', (payload, cb) => this.handleRoomKick(socket, payload, cb));

            socket.on('disconnect', () => this.handleDisconnect(socket));
        });
    }

    checkCondition(condition, message, socket, cb) {
        if (condition) {
            cb(null, { error: message });
            console.error(`${socket.id} <!> ${message}`);
            return true;
        }
        return false;
    }

    // Fonction pour gérer le renvoi de l'hôte de la salle
    handleHostKick(room, player) {
        // Si d'autres joueurs sont présents
        if (room.players.length > 1) {
            // Appeler la fonction pour gérer le renvoi du joueur hôte
            this.handlePlayerKick(room, player);

            // Définir le nouvel hôte
            const newHostId = room.players[0];
            room.host = newHostId;
        } else {
            const roomId = player.roomId;
            // Appeler la fonction pour gérer le renvoi du joueur hôte
            this.handlePlayerKick(room, player);

            // Supprimer la salle si aucun joueur n'est présent
            delete this.rooms[roomId];
            console.log(`Room ${roomId} closed.`);
        }
    }

    // Fonction pour gérer le renvoi d'un joueur
    handlePlayerKick(room, player) {
        // Vérifier si le socket du joueur à renvoyer existe
        const socket = this.io.sockets.sockets.get(player.id);
        if (socket) {
            // Retirer le joueur de la salle
            socket.leave(room.id);
        }

        const playerIndex = room.players.indexOf(player.id);
        if (playerIndex !== -1) {
            room.players.splice(playerIndex, 1);
        }

        // Nettoyer le timer du joueur à renvoyer
        player.resetInterval.clear();

        console.log(`${player.id} kicked from room ${player.roomId}`);

        player.roomId = null;
    }


    // Fonction pour mettre à jour les joueurs restants dans la salle
    updatePlayersInRoom(room, socket) {
        const playersUpdate = [];
        for (const playerId of room.players) {
            const player = this.players.find(p => p.id === playerId);
            if (player) {
                const { name, currentPosition, currentPiece, nextPiece, holdPiece, id, grid } = player;
                const playerUpdate = {
                    name: name,
                    piece: {
                        current: {
                            position: (id === socket.id || room.mode === 'Expert') ? currentPosition : null,
                            content: (id === socket.id || room.mode === 'Expert') ? currentPiece : null,
                        },
                        next: (id === socket.id || room.mode === 'Expert') ? nextPiece : null,
                        hold: (id === socket.id || room.mode === 'Expert') ? holdPiece : null,
                    },
                    grid: (id === socket.id || room.mode === 'Expert') ? grid : player.calculateSpectrum()
                };
                playersUpdate.push(playerUpdate);
            }
        }
        return playersUpdate;
    }

    handleRoomCreate(socket, payload, cb) {
        const { mode } = payload;
        const player = this.players.find(player => player.id === socket.id);
        if (this.checkCondition(!player, 'Player not found', socket, cb)) return;
        if (this.checkCondition(player.roomId !== null, 'You are already in a room', socket, cb)) return;
        if (this.checkCondition(mode !== 'Standard' && mode !== 'Expert', 'Invalid room mode', socket, cb)) return;

        let roomId;
        do {
            roomId = Array.from({ length: 6 }, () => Math.random().toString(36).charAt(2)).join('');
        } while (this.rooms[roomId]);

        const room = new Room(socket.id, mode);
        this.rooms[roomId] = room;
        player.roomId = roomId;

        socket.join(roomId);
        cb(null, { error: null });

        socket.emit('tetris:room:joined', { id: roomId, mode: mode, active: false, leader: player.name });

        // Mettre à jour les joueurs restants dans la salle
        const playersUpdate = this.updatePlayersInRoom(room, socket);

        // Émettre un événement pour mettre à jour la salle
        socket.emit('tetris:room:updated', { leader: player.name, players: playersUpdate });

        console.log(`${socket.id} created room ${roomId}`);
    }

    handleRoomJoin(socket, payload, cb) {
        const { id } = payload;
        if (this.checkCondition(!id, 'Room ID is required', socket, cb)) return;
        const player = this.players.find(player => player.id === socket.id);
        if (this.checkCondition(!player, 'Player not found', socket, cb)) return;
        const room = this.rooms[id];
        if (this.checkCondition(!room, `Room not found with ID: ${id}`, socket, cb)) return;
        if (this.checkCondition(room.players.length >= 9, 'Room is full', socket, cb)) return;
        if (this.checkCondition(player.roomId !== null, 'Player is already in a room', socket, cb)) return;

        room.addPlayer(player.id);
        player.roomId = id;
        socket.join(id);

        cb(null, { error: null });

        const leader = this.players.find(player => player.id === room.host);
        socket.emit('tetris:room:joined', { id: id, mode: room.mode, active: false, leader: leader.name });

        // Mettre à jour les joueurs restants dans la salle
        const playersUpdate = this.updatePlayersInRoom(room, socket);

        // Émettre un événement pour mettre à jour la salle
        this.io.to(id).emit('tetris:room:updated', { leader: leader.name, players: playersUpdate });

        console.log(`${socket.id} joined room ${id}`);
    }

    handleRoomLeave(socket, cb) {
        const player = this.players.find(player => player.id === socket.id);
        if (this.checkCondition(!player, `Player not found`, socket, cb)) return;
        if (this.checkCondition(!player.roomId, `You are not in any room`, socket, cb)) return;
        const room = this.rooms[player.roomId];
        if (this.checkCondition(!room, `Room ${player.roomId} does not exist`, socket, cb)) return;
        const index = room.players.indexOf(socket.id);
        if (this.checkCondition(index === -1, `You are not in room ${player.roomId}`, socket, cb)) return;

        if (socket.id === room.host) {
            this.handleHostKick(room, player);
        } else {
            this.handlePlayerKick(room, player);
        }

        // Trouver le leader de la salle
        const leader = this.players.find(player => player.id === room.host);

        // Mettre à jour les joueurs restants dans la salle
        const playersUpdate = this.updatePlayersInRoom(room, socket);

        // Émettre un événement pour mettre à jour la salle
        this.io.to(leader.roomId).emit('tetris:room:updated', { leader: leader.name, players: playersUpdate });

        cb(null, { error: null });

        socket.emit('tetris:room:leave');
    }

    updateIntervalFall(socket, player, room, level, timer) {
        player.addPenalty();
        player.currentPosition.row += 1;

        if (!player.isPieceCanMove()) {
            player.currentPosition.row -= 1;
            player.addPieceToGrid();

            const penalty = player.removeCompletedLines();
            if (penalty > 1) {
                const playersInRoom = this.players.filter(otherPlayer => room.players.includes(otherPlayer.id) && otherPlayer.id !== player.id);
                playersInRoom.forEach(otherPlayer => {
                    otherPlayer.penalty += penalty - 1;
                });
            }

            if (player.isGameEnd()) {
                socket.emit('tetris:game:ended');
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
                this.updateIntervalFall(socket, player, room, level, timer);
            }, timer);
        }

        // Trouver le leader de la salle
        const leader = this.players.find(player => player.id === room.host);

        // Mettre à jour les joueurs restants dans la salle
        const playersUpdate = this.updatePlayersInRoom(room, socket);

        // Émettre un événement pour mettre à jour la salle
        this.io.to(leader.roomId).emit('tetris:room:updated', { leader: leader.name, players: playersUpdate });
    };

    handleRoomGameStart(socket, cb) {
        const player = this.players.find(player => player.id === socket.id);
        if (this.checkCondition(!player, `Player not found`, socket, cb)) return;
        if (this.checkCondition(!player.roomId, `You are not in any room`, socket, cb)) return;
        if (this.checkCondition(!this.rooms[player.roomId], `Room does not exist`, socket, cb)) return;

        const room = this.rooms[player.roomId];
        const index = room.players.indexOf(socket.id);
        if (this.checkCondition(index === -1, `You are not in the room`, socket, cb)) return;
        if (this.checkCondition(player.game, `Game already started`, socket, cb)) return;

        const piece = new Piece();
        const position = new Position(piece.shape);
        room.addPiece(piece, position);

        const roomPlayers = this.players.filter(player => room.players.includes(player.id));

        // Trouver le leader de la salle
        const leader = this.players.find(player => player.id === room.host);

        roomPlayers.forEach(player => {
            player.game = true;
            player.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
            player.currentPiece = Object.create(room.pieces[0]);
            player.currentPosition = Object.create(room.positions[0]);
            player.addPieceToGrid();

            const playerSocket = this.io.sockets.sockets.get(player.id);

            player.resetInterval.set(() => {
                this.updateIntervalFall(playerSocket, player, room, 0, 800);
            }, 800);

            // Mettre à jour les joueurs restants dans la salle
            const playersUpdate = this.updatePlayersInRoom(room, playerSocket);

            // Émettre un événement pour mettre à jour la salle
            playerSocket.emit('tetris:room:updated', { leader: leader.name, players: playersUpdate });
        });

        this.io.to(player.roomId).emit("tetris:game:started");

        console.log(`Game started in room ${player.roomId}`);
    }

    handleRoomGameAction(socket, payload, cb) {

        const { action } = payload;

        if (this.checkCondition(!['move-left', 'move-right', 'move-down', 'move-space', 'rotate-left', 'rotate-right'].includes(action), `Invalid action`, socket, cb)) return;
        const player = this.players.find(player => player.id === socket.id && player.roomId);
        if (this.checkCondition(!player, `Player not found`, socket, cb)) return;
        const room = this.rooms[player.roomId];
        if (this.checkCondition(!room, `Room not found`, socket, cb)) return;
        if (this.checkCondition(!room.players.includes(player.id), `Player is not in the room ${room.id}`, socket, cb)) return;
        if (this.checkCondition(!player.game, `Game has not started yet`, socket, cb)) return;

        switch (action) {
            case 'move-left':
                player.currentPosition.col -= 1;
                if (!player.isPieceCanMove()) {
                    player.currentPosition.col += 1;
                }
                break;
            case 'move-right':
                player.currentPosition.col += 1;
                if (!player.isPieceCanMove()) {
                    player.currentPosition.col -= 1;
                }
                break;
            case 'move-down':
                player.currentPosition.row += 1;
                if (!player.isPieceCanMove()) {
                    player.currentPosition.row -= 1;
                }
                break;
            case 'rotate-left':
                player.currentPiece.rotatePieceLeft();
                if (!player.isPieceCanMove()) {
                    player.currentPiece.rotatePieceRight();
                }
                break;
            case 'rotate-right':
                player.currentPiece.rotatePieceRight();
                if (!player.isPieceCanMove()) {
                    player.currentPiece.rotatePieceLeft();
                }
                break;
            case 'move-space':
                player.currentPosition.row += 1;
                while (player.isPieceCanMove()) {
                    player.currentPosition.row += 1;
                }
                player.currentPosition.row -= 1;
                break;
            default:
                break;
        }

        // Trouver le leader de la salle
        const leader = this.players.find(player => player.id === room.host);

        // Mettre à jour les joueurs restants dans la salle
        const playersUpdate = this.updatePlayersInRoom(room, socket);

        // Émettre un événement pour mettre à jour la salle
        this.io.to(leader.roomId).emit('tetris:room:updated', { leader: leader.name, players: playersUpdate });
    }

    handlePlayerRename(socket, payload, cb) {
        const { name } = payload;
        const player = this.players.find(player => player.id === socket.id);
        if (this.checkCondition(!player, `Player not found.`, socket, cb)) return;
        if (this.checkCondition(name.length < 3 || name.length > 16, `Name must be between 3 and 16 characters long.`, socket, cb)) return;
        const allowedCharacters = /^(?:\w){3,16}$/;
        if (this.checkCondition(!allowedCharacters.test(name), `Name can only contain alphabets (uppercase or lowercase) and numbers.`, socket, cb)) return;
        if (this.checkCondition(this.players.some(p => p.name === name), `The name "${name}" is already in use by another player`, socket, cb)) return;
        player.name = name;
        cb(null, { name: name });
        console.log(`${socket.id} has been renamed to ${name}`);
    }

    handleRoomList(socket, payload, cb) {

        const { id } = payload;

        let filteredRooms = Object.values(this.rooms);
        if (id && id.trim() !== '') {
            filteredRooms = filteredRooms.filter(room => room.id.startsWith(id));
        }

        const roomList = filteredRooms.map(room => ({ id: room.id, mode: room.mode }));
        cb(roomList);

        console.log(`Room list sent to ${socket.id}`);
    }

    // Gérer le renvoi d'un joueur de la salle
    handleRoomKick(socket, payload, cb) {
        const { name } = payload;

        // Vérifier le nom du joueur invalide
        if (this.checkCondition(!name, "Invalid player name", socket, cb)) return;

        // Trouver le joueur
        const player = this.players.find(player => player.id === socket.id);
        // Vérifier si le joueur existe
        if (this.checkCondition(!player, "Player not found", socket, cb)) return;

        // Vérifier si le joueur est dans une salle
        if (this.checkCondition(!player.roomId, "Player is not in any room", socket, cb)) return;

        // Trouver la salle
        const room = this.rooms[player.roomId];
        // Vérifier si la salle existe
        if (this.checkCondition(!room, `Room ${player.roomId} not found`, socket, cb)) return;

        // Vérifier si le joueur est l'hôte de la salle
        if (this.checkCondition(player.id !== room.host, `You are not the host of room ${player.roomId}`, socket, cb)) return;

        // Trouver le joueur à renvoyer
        const playerToKick = this.players.find(player => player.name === name);
        // Trouver l'index du joueur dans la salle
        const playerIndex = room.players.indexOf(playerToKick.id);

        // Vérifier si le joueur à renvoyer est dans la salle
        if (this.checkCondition(playerIndex === -1, `Player ${name} is not in room ${player.roomId}`, socket, cb)) return;

        // Si le joueur à renvoyer est l'hôte
        if (playerToKick.id === room.host) {
            this.handleHostKick(room, playerToKick);
        } else {
            this.handlePlayerKick(room, playerToKick);
        }

        cb(null, { error: null });

        const playerSocket = this.io.sockets.sockets.get(playerToKick.id);
        if (playerSocket) {
            playerSocket.emit('tetris:room:leave');
        }

        // Trouver le leader de la salle
        const leader = this.players.find(player => player.id === room.host);

        // Mettre à jour les joueurs restants dans la salle
        const playersUpdate = this.updatePlayersInRoom(room, socket);

        // Émettre un événement pour mettre à jour la salle
        this.io.to(leader.roomId).emit('tetris:room:updated', { leader: leader.name, players: playersUpdate });
    }

    handleDisconnect(socket) {
        const player = this.players.find(player => player.id === socket.id);
        if (!player) {
            console.error(`Player with socket ID ${socket.id} not found.`);
            return;
        }

        if (player.roomId) {
            const room = this.rooms[player.roomId];
            if (room) {
                if (socket.id === room.host) {
                    this.handleHostKick(room, player);
                } else {
                    this.handlePlayerKick(room, player);
                }
            }
        }
        this.players.splice(this.players.findIndex(player => player.id === socket.id), 1);
        console.log(`${socket.id} disconnected`);
    }
}

module.exports = GameManager;
