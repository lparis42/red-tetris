// GameManager.js
const Player = require('./Player');
const Room = require('./Room');
const Piece = require('./Piece');
const Position = require('./Position');

const ROWS = 20;
const COLS = 10;

class GameManager
{
    #players;
    #rooms;

    constructor(io)
    {
        this.#players = new Map();
        this.#rooms = new Map();

        this.io = io;
        this.players = [];
        this.rooms = {};
        this.setupSocketHandlers();
    }

    setupSocketHandlers()
    {
        this.io.on('connection', (socket) =>
        {
            console.log(`${socket.id} connected`);

            const player = new Player(socket.id);

            this.#players.set(socket.id, player);
            this.players.push(player);

            socket.on('tetris:player:rename', (payload, cb) => this.handlePlayerRename(socket, payload, cb));

            socket.on('tetris:room:list',   (payload, cb) => this.handleRoomList(socket, payload, cb));
            socket.on('tetris:room:create', (payload, cb) => this.handleRoomCreate(socket, payload, cb));
            socket.on('tetris:room:join',   (payload, cb) => this.handleRoomJoin(socket, payload, cb));
            socket.on('tetris:room:leave',  (         cb) => this.handleRoomLeave(socket, cb));
            socket.on('tetris:room:kick', (playerId, cb) => this.handleRoomKick(socket, playerId, cb));

            socket.on('tetris:game:start', (cb) => this.handleRoomGameStart(socket, cb));
            socket.on('tetris:game:action', (action, cb) => this.handleRoomGameAction(socket, action, cb));

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

    handlePlayerRename(socket, payload, cb)
    {
        const player = this.#players.get(socket.id);

        const { name } = payload ?? {};

        // Name is Required
        if ( ! name )
        {
            if ( typeof cb === 'function' )
            {
                cb({ error: `Name is required` });
            }

            return ;
        }

        // Check Name Format
        if ( ! Player.isValidName(name) )
        {
            if ( typeof cb === 'function' )
            {
                cb({ error: `Invalid name format: (a-z, A-Z, 0-9, _){3, 16}` });
            }

            return ;
        }

        // Check Name Uniqueness
        let nameIsUnique = true;

        for ( const other of this.#players.values() )
        {
            if ( other.name === name )
            {
                nameIsUnique = false;
                break ;
            }
        }

        if ( ! nameIsUnique )
        {
            if ( typeof cb === 'function' )
            {
                cb({ error: `Name is already taken` });
            }

            return ;
        }

        // Set Player
        player.name = name;

        // Response
        if ( typeof cb === 'function' )
        {
            cb({ name });
        }
    }

    handleRoomList(socket, payload, cb)
    {
        const { id = '' } = payload ?? {};

        // Filter Rooms
        const rooms = [];

        // Note: Could limit result length
        for ( const room of this.#rooms.values() )
        {
            if ( room.id.startsWith(id) )
            {
                rooms.push({ id: room.id, mode: room.mode });
            }
        }

        // Response
        if ( typeof cb === 'function' )
        {
            cb({ id, rooms });
        }
    }

    handleRoomCreate(socket, payload, cb)
    {
        const player = this.#players.get(socket.id);

        // Hasn't set name
        if ( ! player.name )
        {
            if ( typeof cb === 'function' )
            {
                cb({ error: `You must set your name first` });
            }

            return ;
        }

        // Already in a Room
        if ( player.isInRoom() )
        {
            if ( typeof cb === 'function' )
            {
                cb({ error: `You already are in a room` });
            }

            return ;
        }

        const { mode } = payload ?? {};

        // Invalid Mode
        if ( ! mode || ! Room.isValidMode(mode.toLowerCase()) )
        {
            if ( typeof cb === 'function' )
            {
                cb({ error: `Invalid room mode` });
            }

            return ;
        }

        // Create Room
        const room = new Room(player, mode.toLowerCase());

        // Add Room to Manager
        this.#rooms.set(room.id, room);

        // Join Room
        this.handleRoomJoin(socket, { id: room.id });
    }

    handleRoomJoin(socket, payload, cb)
    {
        const player = this.#players.get(socket.id);

        // Hasn't set name
        if ( ! player.name )
        {
            if ( typeof cb === 'function' )
            {
                cb({ error: `You must set your name first` });
            }

            return ;
        }

        // Already in a Room
        if ( player.isInRoom() )
        {
            if ( typeof cb === 'function' )
            {
                cb({ error: `You are already in a room` });
            }

            return ;
        }

        const { id } = payload ?? {};

        // Required ID
        if ( ! id )
        {
            if ( typeof cb === 'function' )
            {
                cb({ error: `Room ID is required` });
            }

            return ;
        }

        const room = this.#rooms.get(id);

        // Room doesn't exist
        if ( ! room )
        {
            if ( typeof cb === 'function' )
            {
                cb({ error: `Room not found` });
            }

            return ;
        }

        // Room is full
        if ( room.isFull() )
        {
            if ( typeof cb === 'function' )
            {
                cb({ error: `Room is full` });
            }

            return ;
        }

        // Join Room
        player.joinRoom(room);

        socket.join(room.id); // Note: Could be moved into `joinRoom` if socket was store as property

        // Emit
        const leader = this.#players.get(room.host.id);

        socket.emit('tetris:room:joined', { id: room.id, mode: room.mode, active: false, leader: leader.name });

        // Update Room
        this._onRoomUpdated(room);
    }

    handleRoomLeave(socket, cb)
    {
        const player = this.#players.get(socket.id);

        // Not in a Room
        if ( ! player.isInRoom() )
        {
            if ( typeof cb === 'function' )
            {
                cb({ error: `You are not in a room` });
            }

            return ;
        }

        const room = player.getRoom();
        const wasRoomLeader = player.isRoomLeader(room);

        // Leave Room
        player.leaveRoom(room);

        socket.leave(room.id);

        // Response
        if ( typeof cb === 'function' )
        {
            cb({ id: room.id });
        }

        // Delete Room
        if ( room.isEmpty() )
        {
            return this.#rooms.delete(room.id);
        }

        // Update Room
        this._onRoomUpdated(room, wasRoomLeader);
    }

    updateIntervalFall(playerSocket, player, room, level, timer) {
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
        socket.emit('tetris:game:update:grid', playerGrid);

        const spectreToUpdate = player.calculateSpectrum();
        socket.broadcast.to(player.roomId).emit('tetris:game:update:spectre', player.name, spectreToUpdate);
    };

    handleRoomGameStart(socket, cb) {
        const player = this.players.find(player => player.id === socket.id);
        if (this.checkCondition(!player, `Player not found`, null, socket, cb)) return;
        if (this.checkCondition(!player.roomId, `You are not in any room`, null, socket, cb)) return;
        if (this.checkCondition(!this.rooms[player.roomId], `Room does not exist`, null, socket, cb)) return;

        const room = this.rooms[player.roomId];
        const index = room.players.indexOf(socket.id);
        if (this.checkCondition(index === -1, `You are not in the room`, null, socket, cb)) return;
        if (this.checkCondition(player.isGameStart, `Game already started`, null, socket, cb)) return;

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
        if (this.checkCondition(!['move-left', 'move-right', 'move-down', 'move-space', 'rotate-left', 'rotate-right'].includes(action), `Invalid action`, socket, cb)) return;
        const player = this.players.find(player => player.id === socket.id && player.roomId);
        if (this.checkCondition(!player, `Player not found`, null, socket, cb)) return;
        const room = this.rooms[player.roomId];
        if (this.checkCondition(!room, `Room not found`, null, socket, cb)) return;
        if (this.checkCondition(!room.players.includes(player.id), `Player is not in the room ${room.id}`, null, socket, cb)) return;
        if (this.checkCondition(!player.isGameStart, `Game has not started yet`, null, socket, cb)) return;

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

    handleRoomKick(socket, playerId, cb) {
        if (this.checkCondition(!playerId, `Invalid playerId`, playerId, socket, cb)) return;

        const player = this.players.find(player => player.id === socket.id);
        if (this.checkCondition(!player, `Player not found`, playerId, socket, cb)) return;

        if (this.checkCondition(!player.roomId, `Player is not in any room`, playerId, socket, cb)) return;

        const room = this.rooms[player.roomId];
        if (this.checkCondition(!room, `Room ${player.roomId} not found`, playerId, socket, cb)) return;

        if (this.checkCondition(player.id !== room.host, `You are not the host of room ${player.roomId}`, playerId, socket, cb)) return;

        const playerIndex = room.players.indexOf(playerId);
        if (this.checkCondition(playerIndex === -1, `Player ${playerId} is not in room ${player.roomId}`, playerId, socket, cb)) return;

        if (playerId === room.host) {
            const remainingPlayers = room.players.filter(playerId => playerId !== socket.id);
            if (remainingPlayers.length > 0) {
                const newHostId = remainingPlayers[0];
                room.host = newHostId;
                const newHostPlayer = this.players.find(player => player.id === newHostId);
                if (newHostPlayer) {
                    newHostPlayer.isHost = true;
                } else {
                    console.error(`New host player ${newHostId} not found.`);
                }
            } else {
                delete this.rooms[roomId];
                console.log(`Room ${roomId} closed.`);
            }
        } else {
            const playerSocket = this.io.sockets.sockets.get(playerId);
            if (this.checkCondition(!playerSocket, `Player to kick not found`, null, socket, cb)) return;
            playerSocket.leave(player.roomId);
            playerSocket.emit('tetris:room:kick', playerId);
            room.players.splice(playerIndex, 1);
            const leader = this.players.find(player => player.id === room.host);
            const playersUpdate = {
                name: [],
                piece: {
                    current: {
                        position: [],
                        content: [],
                    },
                    next: [],
                    hold: [],
                },
                grid: [],
            };
            for (const playerId of room.players) {
                const player = this.players.find(p => p.id === playerId);
                if (player) {
                    const { name, currentPosition, currentPiece, nextPiece, holdPiece, id, grid } = player;
                    playersUpdate.name.push(name);
                    playersUpdate.piece.current.position.push(currentPosition);
                    playersUpdate.piece.current.content.push(currentPiece);
                    playersUpdate.piece.next.push(nextPiece);
                    playersUpdate.piece.hold.push(holdPiece);
                    playersUpdate.grid.push((id === socket.id || room.mode === 'Expert') ? grid : player.calculateSpectrum());
                }
            }
            this.io.to(room.id).emit('tetris:room:updated', { leader: leader.name, players: playersUpdate });
            this.players.find(p => p.id === playerId).roomId = null;
            console.log(`${playerId} kicked from room ${player.roomId}`);
        }
        cb(null, playerId);
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
                    const remainingPlayers = room.players.filter(playerId => playerId !== socket.id);
                    if (remainingPlayers.length > 0) {
                        const newHostId = remainingPlayers[0];
                        room.host = newHostId;
                        const newHostPlayer = this.players.find(player => player.id === newHostId);
                        if (newHostPlayer) {
                            newHostPlayer.isHost = true;
                        } else {
                            console.error(`New host player ${newHostId} not found.`);
                        }
                    } else {
                        delete this.rooms[roomId];
                        console.log(`Room ${roomId} closed.`);
                    }
                } else {
                    player.resetInterval.clear();
                    socket.leave(player.roomId);
                    room.players = room.players.filter(p => p !== socket.id);
                    const leader = this.players.find(player => player.id === room.host);
                    const playersUpdate = {
                        name: [],
                        piece: {
                            current: {
                                position: [],
                                content: [],
                            },
                            next: [],
                            hold: [],
                        },
                        grid: [],
                    };
                    for (const playerId of room.players) {
                        const player = this.players.find(p => p.id === playerId);
                        if (player) {
                            const { name, currentPosition, currentPiece, nextPiece, holdPiece, id, grid } = player;
                            playersUpdate.name.push(name);
                            playersUpdate.piece.current.position.push(currentPosition);
                            playersUpdate.piece.current.content.push(currentPiece);
                            playersUpdate.piece.next.push(nextPiece);
                            playersUpdate.piece.hold.push(holdPiece);
                            playersUpdate.grid.push((id === socket.id || room.mode === 'Expert') ? grid : player.calculateSpectrum());
                        }
                    }
                    this.io.to(room.id).emit('tetris:room:updated', { leader: leader.name, players: playersUpdate });

                    console.log(`${socket.id} left room ${player.roomId}`);
                }
            }
        }
        this.players.splice(this.players.findIndex(player => player.id === socket.id), 1);
        console.log(`${socket.id} disconnected`);
    }

    /**
     * onRoomUpdate
     */
    _onRoomUpdated(room, hasLeaderChanged = true)
    {
        const players = room.getPlayers().map(({ name }) => ({ name }));
        const leader = ( hasLeaderChanged ) ? room.getLeader().name : undefined;

        this.io.to(room.id).emit('tetris:room:updated', { leader, players });
    }
}

module.exports = GameManager;
