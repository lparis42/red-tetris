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
            socket.on('tetris:room:list', (cb) => this.handleRoomList(socket, cb));
            socket.on('tetris:room:kick', (payload, cb) => this.handleRoomKick(socket, payload, cb));

            socket.on('disconnect', () => this.handleDisconnect(socket));
        });
    }

    checkCondition(condition, message, socket, cb) {
        if (condition) {
            if (cb) {
                cb({ error: message });
            }
            console.log(`${socket.id} <!> ${message}`);
            return true;
        }
        return false;
    }

    // Fonction pour gérer le renvoi de l'hôte de la salle
    handleHostKick(room, player) {

        // Si d'autres joueurs sont présents
        if (room.players.length > 1) {
            this.handlePlayerKick(room, player);

            // Définir le nouvel hôte
            const newHostId = room.players[0];
            room.host = newHostId;
        } else {
            const roomId = player.roomId;
            this.handlePlayerKick(room, player);

            // Supprimer la salle si aucun joueur n'est présent
            delete this.rooms[roomId];
            console.log(`Room ${roomId} closed.`);
        }
    }

    // Fonction pour gérer le renvoi d'un joueur
    handlePlayerKick(room, player) {

        // Retirer de la salle
        const socket = this.io.sockets.sockets.get(player.id);
        if (socket) {
            socket.leave(player.roomId);
        }
        const playerIndex = room.players.indexOf(player.id);
        if (playerIndex !== -1) {
            room.players.splice(playerIndex, 1);
        }
        console.log(`${player.id} kicked from room ${player.roomId}`);

        // Remise à zéro
        player.roomId = null;
        player.closeGame();
    }

    handleRoomCreate(socket, payload, cb) {
        const { id, mode } = payload;
        const player = this.players.find(player => player.id === socket.id);
        if (this.checkCondition(!player, 'Player not found', socket, cb)) return;
        if (this.checkCondition(player.roomId !== null, 'You are already in a room', socket, cb)) return;
        if (this.checkCondition(mode !== 'Easy' && mode !== 'Standard' && mode !== 'Expert', 'Invalid room mode', socket, cb)) return;

        let roomId;
        if (id) {
            roomId = id;
            if (this.rooms[roomId]) {
                this.handleRoomJoin(socket, { id: id }, cb);
                return;
            }
        } else {
            do {
                roomId = Array.from({ length: 6 }, () => Math.random().toString(36).charAt(2)).join('');
            } while (this.rooms[roomId]);
        }

        const room = new Room(socket.id, mode);
        this.rooms[roomId] = room;
        player.roomId = roomId;

        if (mode === 'Easy') {
            room.cols = 12;
        }

        socket.join(roomId);
        cb({ error: null });

        socket.emit('tetris:room:joined', { id: roomId, mode: mode, active: false, leader: player.name });

        const playerNames = room.players.map(playerId => this.players.find(player => player.id === playerId).name);
        socket.emit('tetris:room:updated', { leader: player.name, players: playerNames });

        console.log(`${socket.id} created room ${roomId}`);
    }

    handleRoomJoin(socket, payload, cb) {
        const { id } = payload;
        if (this.checkCondition(!id, 'Room ID is required', socket, cb)) return;
        const player = this.players.find(player => player.id === socket.id);
        if (this.checkCondition(!player, 'Player not found', socket, cb)) return;
        let room = this.rooms[id];
        if (!room) {
            this.handleRoomCreate(socket, { id: id, mode: 'Standard' }, cb);
            return;
        } else {
            if (this.checkCondition(room.players.length >= 9, 'Room is full', socket, cb)) return;
            if (this.checkCondition(room.start === true, 'Room is currently playing', socket, cb)) return;
            if (this.checkCondition(player.roomId !== null, 'Player is already in a room', socket, cb)) return;

            room.addPlayer(player.id);
            player.roomId = id;
            socket.join(id);

            cb({ error: null });

            const leader = this.players.find(player => player.id === room.host);
            socket.emit('tetris:room:joined', { id: id, mode: room.mode, active: false, leader: leader.name });

            const playerNames = room.players.map(playerId => this.players.find(player => player.id === playerId).name);
            this.io.to(id).emit('tetris:room:updated', { leader: leader.name, players: playerNames });

            console.log(`${socket.id} joined room ${id}`);
        }
    }

    handleRoomLeave(socket, cb) {
        // Erreurs
        const player = this.players.find(player => player.id === socket.id);
        if (this.checkCondition(!player, `Player not found`, socket, cb)) return;
        if (this.checkCondition(!player.roomId, `You are not in any room`, socket, cb)) return;
        const room = this.rooms[player.roomId];
        if (this.checkCondition(!room, `Room ${player.roomId} does not exist`, socket, cb)) return;
        const index = room.players.indexOf(socket.id);
        if (this.checkCondition(index === -1, `You are not in room ${player.roomId}`, socket, cb)) return;

        // Kick
        if (socket.id === room.host) {
            this.handleHostKick(room, player);
        } else {
            this.handlePlayerKick(room, player);
        }

        // Retours
        cb({ error: null });
        socket.emit('tetris:room:leave');
        const leader = this.players.find(player => player.id === room.host);
        const playerNames = room.players.map(playerId => this.players.find(player => player.id === playerId).name);
        this.io.to(leader.roomId).emit('tetris:room:updated', { leader: leader.name, players: playerNames });
    }

    updateIntervalFall(socket, player, room, level, timer) {

        if (player.hold === 1) {
            if (player.holdPiece) {
                const tempPiece = Object.create(player.currentPiece);
                player.currentPiece = player.holdPiece;
                player.holdPiece = tempPiece;
                player.currentPosition.row = -player.currentPiece.shape.length;
            } else {
                player.holdPiece = Object.create(player.currentPiece);

                level++;
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

                if (room.mode === 'Expert') {
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
                }
                player.resetInterval.clear();
                player.resetInterval.set(() => {
                    this.updateIntervalFall(socket, player, room, level, timer);
                }, timer);
            }
            player.hold = 2;
        } else {

            player.addPenalty();
            player.currentPosition.row += 1;

            if (!player.isPieceCanMove(room.cols)) {
                player.currentPosition.row -= 1;
                player.addPieceToGrid();

                const penalty = player.removeCompletedLines(room.cols);
                if (penalty === 1) {
                    player.score += 40;
                } else if (penalty === 2) {
                    player.score += 100;
                } else if (penalty === 3) {
                    player.score += 300;
                } else if (penalty >= 4) {
                    player.score += 1200;
                }
                if (penalty > 1) {
                    const playersInRoom = this.players.filter(otherPlayer => room.players.includes(otherPlayer.id) && otherPlayer.id !== player.id);
                    playersInRoom.forEach(otherPlayer => {
                        otherPlayer.penalty += penalty - 1;
                    });
                }

                if (player.isGameEnd(room.cols)) {
                    room.players.forEach(playerId => {
                        const clientSocket = this.io.sockets.sockets.get(playerId);
                        const isCurrentSocketExpert = room.mode === 'Expert' || clientSocket.id === socket.id;
                        const pieceData = {
                            name: player.name,
                            current: {
                                position: isCurrentSocketExpert ? { x: player.currentPosition.col, y: player.currentPosition.row } : null,
                                content: isCurrentSocketExpert ? player.currentPiece.shape : null
                            },
                            next: isCurrentSocketExpert ? player.nextPiece.shape : null,
                            hold: player.holdPiece && isCurrentSocketExpert ? player.holdPiece.shape : null
                        };

                        const gridData = {
                            name: player.name,
                            grid: isCurrentSocketExpert ? player.grid : player.calculateSpectrum(room.cols)
                        };

                        const scoreData = {
                            name: player.name,
                            score: player.score,
                            level: level
                        };
                        clientSocket.emit('tetris:game:updated', { piece: pieceData, grid: gridData, score: scoreData });
                    });

                    player.closeGame();
                    this.io.to(player.roomId).emit("tetris:game:ended", { name: player.name });

                    const playersInRoom = this.players.filter(p => room.players.includes(p.id));
                    const remainingPlayers = playersInRoom.filter(p => p.game);

                    if (remainingPlayers.length == 0) {
                        room.start = false;
                    }
                    // S'il reste un seul joueur en jeu
                    else if (remainingPlayers.length === 1) {
                        room.start = false;
                        const winner = remainingPlayers[0];
                        winner.closeGame();

                        this.io.to(player.roomId).emit("tetris:game:winner", { name: winner.name });

                    }

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

                if (room.mode === 'Expert') {
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
                }
                player.resetInterval.clear();
                player.hold = 0;
                player.lock = false;
                player.resetInterval.set(() => {
                    this.updateIntervalFall(socket, player, room, level, timer);
                }, timer);
            }
        }
        room.players.forEach(playerId => {
            const clientSocket = this.io.sockets.sockets.get(playerId);
            const isCurrentSocketExpert = room.mode === 'Expert' || clientSocket.id === socket.id;
            const pieceData = {
                name: player.name,
                current: {
                    position: isCurrentSocketExpert ? { x: player.currentPosition.col, y: player.currentPosition.row } : null,
                    content: isCurrentSocketExpert ? player.currentPiece.shape : null
                },
                next: isCurrentSocketExpert ? player.nextPiece.shape : null,
                hold: player.holdPiece && isCurrentSocketExpert ? player.holdPiece.shape : null
            };

            const gridData = {
                name: player.name,
                grid: isCurrentSocketExpert ? player.grid : player.calculateSpectrum(room.cols)
            };

            const scoreData = {
                name: player.name,
                score: player.score,
                level: level
            };
            clientSocket.emit('tetris:game:updated', { piece: pieceData, grid: gridData, score: scoreData });
        });


    };

    handleRoomGameStart(socket, cb) {
        const player = this.players.find(player => player.id === socket.id);
        if (this.checkCondition(!player, `Player not found`, socket, cb)) return;
        if (this.checkCondition(!player.roomId, `You are not in any room`, socket, cb)) return;
        if (this.checkCondition(!this.rooms[player.roomId], `Room does not exist`, socket, cb)) return;

        const room = this.rooms[player.roomId];
        const index = room.players.indexOf(player.id);
        if (this.checkCondition(index === -1, `You are not in the room`, socket, cb)) return;
        if (this.checkCondition(player.id !== room.host, `You are not the host`, socket, cb)) return;
        if (this.checkCondition(player.game, `Game already started`, socket, cb)) return;

        room.pieces = [];
        room.positions = [];

        const piece = new Piece();
        const position = new Position(piece.shape);
        room.addPiece(piece, position);

        const pieceN = new Piece();
        const positionN = new Position(pieceN.shape);
        room.addPiece(pieceN, positionN);

        room.start = true;

        const roomPlayers = this.players.filter(player => room.players.includes(player.id));
        roomPlayers.forEach(player => {
            player.game = true;
            player.grid = Array.from({ length: ROWS }, () => Array(room.cols).fill(0));
            player.currentPiece = Object.create(room.pieces[0]);
            player.currentPosition = Object.create(room.positions[0]);
            player.nextPiece = Object.create(room.pieces[1]);

            player.resetInterval.set(() => {
                const playerSocket = this.io.sockets.sockets.get(player.id);
                this.updateIntervalFall(playerSocket, player, room, 0, 800);
            }, 800);

            room.players.forEach(playerId => {
                const clientSocket = this.io.sockets.sockets.get(playerId);
                if (clientSocket) {
                    const isCurrentSocketExpert = room.mode === 'Expert' || clientSocket.id === player.id;

                    const pieceData = {
                        name: player.name,
                        current: {
                            position: isCurrentSocketExpert ? { x: player.currentPosition.col, y: player.currentPosition.row } : null,
                            content: isCurrentSocketExpert ? player.currentPiece.shape : null
                        },
                        next: isCurrentSocketExpert ? player.nextPiece.shape : null,
                        hold: player.holdPiece && isCurrentSocketExpert ? player.holdPiece.shape : null
                    };

                    const gridData = {
                        name: player.name,
                        grid: isCurrentSocketExpert ? player.grid : player.calculateSpectrum(room.cols)
                    };

                    clientSocket.emit('tetris:game:updated', { piece: pieceData, grid: gridData });

                } else {
                    console.log(`Socket not found for player ID: ${playerId}`);
                }
            });
        });

        const newHostIndex = (index + 1) % room.players.length;
        room.host = room.players[newHostIndex];
        const leader = this.players.find(player => player.id === room.host);
        this.io.to(player.roomId).emit('tetris:room:updated', { leader: leader.name });

        this.io.to(player.roomId).emit("tetris:game:started");
        cb({ error: null });
        console.log(`Game started in room ${player.roomId}`);
    }

    handleRoomGameAction(socket, payload, cb) {
        const { action } = payload;

        if (this.checkCondition(!['move-left', 'move-right', 'move-down', 'move-space', 'rotate-left', 'rotate-right', 'hold'].includes(action), `Invalid action`, socket, cb)) return;
        const player = this.players.find(player => player.id === socket.id && player.roomId);

        if (this.checkCondition(!player, `Player not found`, socket, cb)) return;
        if (player.lock) return;

        const room = this.rooms[player.roomId];
        if (this.checkCondition(!room, `Room not found`, socket, cb)) return;
        if (this.checkCondition(!room.players.includes(player.id), `Player is not in the room ${room.id}`, socket, cb)) return;
        if (this.checkCondition(!player.game, `Game has not started yet`, socket, cb)) return;

        switch (action) {
            case 'move-left':
                player.currentPosition.col -= 1;
                if (!player.isPieceCanMove(room.cols)) {
                    player.currentPosition.col += 1;
                }
                break;
            case 'move-right':
                player.currentPosition.col += 1;
                if (!player.isPieceCanMove(room.cols)) {
                    player.currentPosition.col -= 1;
                }
                break;
            case 'move-down':
                player.currentPosition.row += 1;
                if (!player.isPieceCanMove(room.cols)) {
                    player.currentPosition.row -= 1;
                }
                break;
            case 'rotate-left':
                {
                    player.currentPiece.rotatePieceLeft();
                    const positionCopy = Object.create(player.currentPosition);
                    const overflow = (player.currentPosition.col + (player.currentPiece.shape[0].length - 1)) - room.cols + 1;

                    if (overflow > 0) {
                        player.currentPosition.col -= overflow;
                    }

                    if (!player.isPieceCanMove(room.cols)) {
                        player.currentPiece.rotatePieceRight();
                        player.currentPosition = positionCopy;
                    }
                }
                break;
            case 'rotate-right':
                {
                    player.currentPiece.rotatePieceRight();
                    const positionCopy = Object.create(player.currentPosition);
                    const overflow = (player.currentPosition.col + (player.currentPiece.shape[0].length - 1)) - room.cols + 1;

                    if (overflow > 0) {
                        player.currentPosition.col -= overflow;
                    }

                    if (!player.isPieceCanMove(room.cols)) {
                        player.currentPiece.rotatePieceLeft();
                        player.currentPosition = positionCopy;
                    }
                }
                break;
            case 'move-space':
                player.currentPosition.row += 1;
                while (player.isPieceCanMove(room.cols)) {
                    player.currentPosition.row += 1;
                }
                player.currentPosition.row -= 1;
                player.lock = true;
                break;
            case 'hold':
                if (player.hold === 0) {
                    player.hold = 1;
                }
                break;
            default:
                break;
        }

        room.players.forEach(playerId => {
            const clientSocket = this.io.sockets.sockets.get(playerId);
            if (clientSocket) {
                const isCurrentSocketExpert = room.mode === 'Expert' || clientSocket.id === socket.id;
                const pieceData = {
                    name: player.name,
                    current: {
                        position: isCurrentSocketExpert ? { x: player.currentPosition.col, y: player.currentPosition.row } : null,
                        content: isCurrentSocketExpert ? player.currentPiece.shape : null
                    },
                    next: null,
                    hold: player.holdPiece && isCurrentSocketExpert ? player.holdPiece.shape : null
                };

                clientSocket.emit('tetris:game:updated', { piece: pieceData });
            } else {
                console.log(`Socket not found for player ID: ${playerId}`);
            }
        });

    }

    handlePlayerRename(socket, payload, cb) {

        // Errors
        const { name } = payload;
        const player = this.players.find(player => player.id === socket.id);
        if (this.checkCondition(!player, `Player not found.`, socket, cb)) return;
        if (this.checkCondition(name.length < 3 || name.length > 16, `Name must be between 3 and 16 characters long.`, socket, cb)) return;
        const allowedCharacters = /^(?:\w){3,16}$/;
        if (this.checkCondition(!allowedCharacters.test(name), `Name can only contain alphabets (uppercase or lowercase) and numbers.`, socket, cb)) return;
        if (this.checkCondition(this.players.some(p => p.name === name), `The name "${name}" is already in use by another player`, socket, cb)) return;

        // Updates
        player.name = name;

        // Returns
        cb({ name: name });

        console.log(`${socket.id} has been renamed to ${name}`);
    }

    handleRoomList(socket, cb) {
        const roomList = [];
        for (const roomId in this.rooms) {
            roomList.push({ id: roomId, mode: this.rooms[roomId].mode });
        }
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

        cb({ error: null });

        const playerSocket = this.io.sockets.sockets.get(playerToKick.id);
        if (playerSocket) {
            playerSocket.emit('tetris:room:leave');
        }

        // Trouver le leader de la salle
        const leader = this.players.find(player => player.id === room.host);

        const playerNames = room.players.map(playerId => this.players.find(player => player.id === playerId).name);
        this.io.to(leader.roomId).emit('tetris:room:updated', { leader: leader.name, players: playerNames });
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

            // Trouver le leader de la salle
            const leader = this.players.find(player => player.id === room.host);

            const playerNames = room.players.map(playerId => this.players.find(player => player.id === playerId).name);
            this.io.to(leader.roomId).emit('tetris:room:updated', { leader: leader.name, players: playerNames });
        }

        this.players.splice(this.players.findIndex(player => player.id === socket.id), 1);
        console.log(`${socket.id} disconnected`);
    }
}

module.exports = GameManager;
