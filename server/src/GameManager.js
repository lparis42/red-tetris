// GameManager.js
const Player = require('./Player');
const Room = require('./Room');
const Piece = require('./Piece');
const Position = require('./Position');

const ROWS = 20;

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
            socket.on('tetris:room:leave', () => this.handleRoomLeave(socket));
            socket.on('tetris:game:start', () => this.handleRoomGameStart(socket));
            socket.on('tetris:game:action', (payload) => this.handleRoomGameAction(socket, payload));
            socket.on('tetris:player:rename', (payload, cb) => this.handlePlayerRename(socket, payload, cb));
            socket.on('tetris:room:list', (payload, cb) => this.handleRoomList(socket, payload, cb));
            socket.on('tetris:room:kick', (payload) => this.handleRoomKick(socket, payload));

            socket.on('disconnect', () => this.handleDisconnect(socket));
        });
    }

    checkCondition(condition, message, socket, cb) {

        if (condition) {
            cb({ error: message });
            console.log(`${socket.id} <!> ${message}`);
            return true;
        }
        return false;
    }

    handleHostKick(room, player) {

        if (room.players.length > 1) {
            this.handlePlayerKick(room, player);

            const newHostId = room.players[0];
            room.leader = newHostId;
        } else {
            const roomId = player.roomId;
            this.handlePlayerKick(room, player);

            delete this.rooms[roomId];
            console.log(`Room ${roomId} closed.`);
        }
    }

    handlePlayerKick(room, player) {

        const socket = this.io.sockets.sockets.get(player.id);
        if (socket) {
            socket.leave(player.roomId);
        }
        const playerIndex = room.players.indexOf(player.id);
        if (playerIndex !== -1) {
            room.players.splice(playerIndex, 1);
        }
        console.log(`${player.id} kicked from room ${player.roomId}`);

        player.roomId = null;
        player.closeGame();
    }

    handleRoomCreate(socket, payload, cb) {

        // Invalid
        if (!socket || typeof socket !== 'object') return;
        if (!payload || typeof payload !== 'object' || Object.keys(payload).length === 0) return;
        if (typeof cb !== 'function') return;
        const { id, mode } = payload;
        const player = this.players.find(player => player.id === socket.id);
        if (!player) return;
        if (player.roomId !== null) return;
        if (mode !== 'Easy' && mode !== 'Standard' && mode !== 'Expert') return;

        // Error
        let roomId = id;
        if (this.rooms[roomId]) {
            this.handleRoomJoin(socket, { id: id }, cb);
            return;
        }

        // Server update
        if (!roomId) {
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

        // Client update
        cb({ error: null });
        socket.emit('tetris:room:joined', { id: roomId, mode: mode, active: false, leader: player.name });
        const playerNames = room.players.map(playerId => this.players.find(player => player.id === playerId).name);
        socket.emit('tetris:room:updated', { leader: player.name, players: playerNames });

        console.log(`${socket.id} created room ${roomId}`);
    }

    handleRoomJoin(socket, payload, cb) {

        // Invalid
        if (!socket || typeof socket !== 'object') return;
        if (!payload || typeof payload !== 'object' || Object.keys(payload).length === 0) return;
        if (typeof cb !== 'function') return;
        const player = this.players.find(player => player.id === socket.id);
        if (!player) return;

        // Error
        const { id } = payload;
        if (this.checkCondition(!id, 'Room ID is required', socket, cb)) return;
        let room = this.rooms[id];
        if (room) {
            if (player.roomId !== null) {
                this.handleRoomLeave(socket);
            }
            if (this.checkCondition(room.players.length >= 9, 'Room is full', socket, cb)) return;
            if (this.checkCondition(room.active === true, 'Room is currently playing', socket, cb)) return;
        } else {
            this.handleRoomCreate(socket, { id: id, mode: 'Standard' }, cb);
            return;
        }

        // Server update
        room.addPlayer(player.id);
        player.roomId = id;
        socket.join(id);

        // Client update
        cb({ error: null });
        const leader = this.players.find(player => player.id === room.leader);
        socket.emit('tetris:room:joined', { id: id, mode: room.mode, active: false, leader: leader.name });
        const playerNames = room.players.map(playerId => this.players.find(player => player.id === playerId).name);
        this.io.to(id).emit('tetris:room:updated', { leader: leader.name, players: playerNames });

        console.log(`${socket.id} joined room ${id}`);
    }

    handleRoomLeave(socket) {
        // Invalid
        if (!socket || typeof socket !== 'object') return;
        const player = this.players.find(player => player.id === socket.id);
        if (!player) return;
        if (!player.roomId) return;
        const room = this.rooms[player.roomId];
        if (!room) return;
        const index = room.players.indexOf(socket.id);
        if (index === -1) return;

        // Server update
        if (socket.id === room.leader) {
            this.handleHostKick(room, player);
        } else {
            this.handlePlayerKick(room, player);
        }

        // Client update
        socket.emit('tetris:room:leave');
        const leader = this.players.find(player => player.id === room.leader);
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
                        room.active = false;
                    }
                    else if (remainingPlayers.length === 1) {
                        room.active = false;
                        const winner = remainingPlayers[0];
                        winner.closeGame();

                        const scoreData = {
                            name: winner.name,
                            score: winner.score,
                        };
                        this.io.to(player.roomId).emit("tetris:game:winner", { scoreData });

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

    handleRoomGameStart(socket) {

        // Invalid
        if (!socket || typeof socket !== 'object') return;
        const player = this.players.find(player => player.id === socket.id);
        if (!player) return;
        if (!player.roomId) return;
        const room = this.rooms[player.roomId];
        if (!room) return;
        if (room.active) return;
        const index = room.players.indexOf(player.id);
        if (index === -1) return;
        if (player.id !== room.leader) return;

        // Server update
        room.pieces = [];
        room.positions = [];
        {
            const piece = new Piece();
            const position = new Position(piece.shape);
            room.addPiece(piece, position);
        }
        {
            const piece = new Piece();
            const position = new Position(piece.shape);
            room.addPiece(piece, position);
        }
        room.active = true;
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
            });
        });

        // Client update
        const newHostIndex = (index + 1) % room.players.length;
        room.leader = room.players[newHostIndex];
        const leader = this.players.find(player => player.id === room.leader);
        this.io.to(player.roomId).emit('tetris:room:updated', { leader: leader.name });
        this.io.to(player.roomId).emit("tetris:game:started");

        console.log(`Game started in room ${player.roomId}`);
    }

    handleRoomGameAction(socket, payload) {

        // Invalid
        if (!socket || typeof socket !== 'object') return;
        if (!payload || typeof payload !== 'object' || Object.keys(payload).length === 0) return;
        const { action } = payload;
        if (!['move-left', 'move-right', 'move-down', 'move-space', 'rotate-left', 'rotate-right', 'hold'].includes(action)) return;
        const player = this.players.find(player => player.id === socket.id && player.roomId);
        if (!player) return;
        if (!player.game) return;
        if (player.lock) return;
        const room = this.rooms[player.roomId];
        if (!room) return;
        if (!room.players.includes(player.id)) return;

        // Server update
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

        // Client update
        room.players.forEach(playerId => {
            const clientSocket = this.io.sockets.sockets.get(playerId);
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
        });
    }

    handlePlayerRename(socket, payload, cb) {

        // Invalid
        if (!socket || typeof socket !== 'object') return;
        if (!payload || typeof payload !== 'object' || Object.keys(payload).length === 0) return;
        if (typeof cb !== 'function') return;
        const { name } = payload;
        const player = this.players.find(player => player.id === socket.id);
        if (!player) return;

        // Error
        if (this.checkCondition(!name || name.length < 3 || name.length > 16, `Name must be between 3 and 16 characters long.`, socket, cb)) return;
        const allowedCharacters = /^(?:\w){3,16}$/;
        if (this.checkCondition(!allowedCharacters.test(name), `Name can only contain alphabets (uppercase or lowercase) and numbers.`, socket, cb)) return;
        if (this.checkCondition(this.players.some(p => p.name === name), `The name "${name}" is already in use by another player`, socket, cb)) return;

        // Server Update
        player.name = name;

        // Client update
        cb({ name: name });

        console.log(`${socket.id} has been renamed to ${name}`);
    }

    handleRoomList(socket, payload, cb) {

        // Invalid
        if (!socket || typeof socket !== 'object') return;
        if (!payload || typeof payload !== 'object') return;
        if (typeof cb !== 'function') return;

        // Client Update 
        const { id } = payload;
        const rooms = [];
        if (id) {
            for (const roomId in this.rooms) {
                if (roomId.includes(id)) {
                    rooms.push({ id: roomId, mode: this.rooms[roomId].mode });
                }
            }
        } else {
            for (const roomId in this.rooms) {
                rooms.push({ id: roomId, mode: this.rooms[roomId].mode });
            }
        }

        cb({ rooms: rooms });

        console.log(`Room list sent to ${socket.id}`);
    }

    handleRoomKick(socket, payload) {

        // Invalid
        if (!socket || typeof socket !== 'object') return;
        if (!payload || typeof payload !== 'object' || Object.keys(payload).length === 0) return;
        const { name } = payload;
        if (!name) return;
        const player = this.players.find(player => player.id === socket.id);
        if (!player || !player.roomId) return;
        const room = this.rooms[player.roomId];
        if (!room) return;
        const playerToKick = this.players.find(player => player.name === name);
        if (!playerToKick) return;
        const playerIndex = room.players.indexOf(playerToKick.id);
        if (playerIndex === -1) return;
        if (player.id !== room.leader) return;
        const playerToKickSocket = this.io.sockets.sockets.get(playerToKick.id);
        if (!playerToKickSocket) return;

        // Server update
        if (playerToKick.id === room.leader) {
            this.handleHostKick(room, playerToKick);
        } else {
            this.handlePlayerKick(room, playerToKick);
        }

        // Client update
        playerToKickSocket.emit('tetris:room:leave');
        const leader = this.players.find(player => player.id === room.leader);
        const playerNames = room.players.map(playerId => this.players.find(player => player.id === playerId).name);
        this.io.to(leader.roomId).emit('tetris:room:updated', { leader: leader.name, players: playerNames });
    }

    handleDisconnect(socket) {

        // Invalid
        if (!socket || !socket || typeof socket !== 'object') return;
        const player = this.players.find(player => player.id === socket.id);
        if (!player) return;

        // Server update
        if (player.roomId) {
            const room = this.rooms[player.roomId];
            if (room) {
                if (socket.id === room.leader) {
                    this.handleHostKick(room, player);
                } else {
                    this.handlePlayerKick(room, player);
                }
            }
            const leader = this.players.find(player => player.id === room.leader);
            const playerNames = room.players.map(playerId => this.players.find(player => player.id === playerId).name);
            this.io.to(leader.roomId).emit('tetris:room:updated', { leader: leader.name, players: playerNames });
        }
        this.players.splice(this.players.findIndex(player => player.id === socket.id), 1);

        console.log(`${socket.id} disconnected`);
    }
}

module.exports = GameManager;
