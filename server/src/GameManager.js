// GameManager.js
const Player = require('./Player');
const Room = require('./Room');
const Piece = require('./Piece');
const Position = require('./Position');

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

            socket.on('createRoom', () => this.handleCreateRoom(socket));
            socket.on('joinRoom', (roomId) => this.handleJoinRoom(socket, roomId));
            socket.on('leaveRoom', () => this.handleLeaveRoom(socket));
            socket.on('startGame', () => this.handleStartGame(socket));
            socket.on('userAction', (action) => this.handleUserAction(socket, action));
            socket.on('kickPlayer', (playerId) => this.handleKickPlayer(socket, playerId));
            socket.on('disconnect', () => this.handleDisconnect(socket));
        });
    }

    handleCreateRoom(socket) {

        const player = this.players.find(player => player.id === socket.id);
        if (player?.roomId !== null) {
            const error = 'You are already in a room';
            socket.emit("serverError", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        let roomId;
        do {
            roomId = this.generateRandomId();
        } while (this.rooms[roomId]);

        socket.join(roomId);

        const room = new Room(socket.id);
        this.rooms[roomId] = room;
        player.roomId = roomId;

        socket.emit('roomCreated', { id: roomId, players: room.players });

        console.log(`${socket.id} created room ${roomId}`);
    }

    handleJoinRoom(socket, roomId) {
        // Logique pour rejoindre une salle
        if (!roomId) {
            console.error("Room Id is not valid");
            return;
        }

        const player = this.players.find(player => player.id === socket.id);
        if (player?.roomId !== null) {
            const error = 'You are already in a room';
            socket.emit("serverError", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        const room = this.rooms[roomId];
        if (!room) {
            const error = `Room not found with ID: ${roomId}`;
            socket.emit("serverError", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        if (room.players.length >= 2) {
            const error = `Room is full with ID: ${roomId}`;
            socket.emit("serverError", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        socket.join(roomId);

        room.addPlayer(socket.id);
        player.roomId = roomId;
        socket.emit("roomJoined", roomId);
        this.io.to(roomId).emit('roomUpdate', room);

        console.log(`${socket.id} joined room ${roomId}`);
    }

    handleLeaveRoom(socket) {
        // Logique pour quitter une salle
        const player = this.players.find(player => player.id === socket.id);
        if (!player || !player.roomId || !this.rooms[player.roomId]) {
            const error = `You are not in any room or room does not exist`;
            socket.emit("serverError", error);
            console.log(`${socket.id} : ${error}`);
            console.error(error);
            return;
        }

        const room = this.rooms[player.roomId];
        if (!room) {
            const error = `Room ${player.roomId} does not exist`;
            socket.emit("serverError", error);
            console.log(`${socket.id} : ${error}`);
            console.error(error);
            return;
        }

        const index = room.players.indexOf(socket.id);
        if (index === -1) {
            const error = `You are not in room ${player.roomId}`;
            socket.emit("serverError", error);
            console.log(`${socket.id} : ${error}`);
            console.error(error);
            return;
        }

        if (socket.id === room.host) {
            this.io.to(player.roomId).emit('roomLeft', player.roomId);
            this.closeRoom(player.roomId);
            console.log(`Host (${socket.id}) left and closed room ${player.roomId}`);
        } else {
            socket.leave(player.roomId);
            room.removePlayer(socket.id);
            this.io.to(player.roomId).emit('roomUpdate', room);
            socket.emit('roomLeft', player.roomId);
            console.log(`${socket.id} left room ${player.roomId}`);
        }
        player.roomId = null;
    }


    handleStartGame(socket) {
        const player = this.players.find(player => player.id === socket.id);

        if (!player || !player.roomId || !this.rooms[player.roomId]) {
            const error = `Invalid player or room`;
            socket.emit("serverError", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        const room = this.rooms[player.roomId];
        if (room.players.length !== 2 || room.host !== socket.id) {
            const error = `Invalid conditions for starting game in room ${player.roomId}`;
            socket.emit("serverError", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        // Fonction pour gérer la descente automatique des pièces
        const updateIntervalFall = (socket, player, room, level, timer) => {
            if (!player.isGameStart) {
                player.gameEnd();
                return;
            }
            console.log(player.id);

            // Déplacer la pièce vers le bas d'une case
            player.removePieceToGrid();
            player.currentPosition.row += 1;

            // Vérifier si la pièce peut descendre d'une case
            if (!player.isPieceCanMove()) {
                // Annuler le déplacement vers le bas de la pièce
                player.currentPosition.row -= 1;
                player.addPieceToGrid();

                if (player.currentPosition.row > 0) {
                    player.checkAndRemoveCompletedLines();
                }

                // Démarrer une nouvelle pièce
                player.currentPiece = new Piece();
                player.currentPosition = new Position(player.currentPiece.shape[0].length);
                if (!player.isPieceCanMove()) {
                    this.io.to(player.roomId).emit('roomGameEnd');
                    this.players.forEach(player => {
                        player.isGameStart = false;
                    });
                }
                else {
                    player.resetInterval.clear();
                    level += 1;
                    if (level >= 0 && level <= 9) {
                        timer = 800;
                    } else if (level >= 10 && level <= 19) {
                        timer = 700;
                    } else if (level >= 20 && level <= 29) {
                        timer = 600;
                    } else if (level >= 30 && level <= 39) {
                        timer = 500;
                    } else if (level >= 30 && level <= 39) {
                        timer = 400;
                    }
                    player.resetInterval.set(() => {
                        updateIntervalFall(socket, player, room, level, timer);
                    }, timer);
                }
            }
            // Ajouter la pièce à la grille
            player.addPieceToGrid();

            // Transmettre les grilles des joueurs aux clients
            const [playerA, playerB] = room.players.map(playerId => this.players.find(p => p.id === playerId));
            if (!playerA || !playerB) {
                const errorMessage = "One or both players are missing";
                socket.emit("serverError", errorMessage);
                console.error(errorMessage);
            } else {
                this.io.to(player.roomId).emit('roomGameUpdate', {
                    gridPlayer1: playerA.grid,
                    gridPlayer2: playerB.grid,
                });
            }

        };

        this.players.forEach(player => {
            player.isGameStart = true;
            player.currentPiece = new Piece();
            player.currentPosition = new Position(player.currentPiece.shape[0].length);
            player.addPieceToGrid();

            player.resetInterval.set(() => {
                const playerSocket = this.io.sockets.sockets.get(player.id);
                updateIntervalFall(playerSocket, player, room, 0, 800);
            }, 800);
            
        });

        const [playerA, playerB] = room.players.map(playerId => this.players.find(p => p.id === playerId));
        if (!playerA || !playerB) {
            const errorMessage = "One or both players are missing";
            this.io.to(player.roomId).emit("serverError", errorMessage);
            console.error(errorMessage);
        } else {
            this.io.to(player.roomId).emit('roomGameStart');
            this.io.to(player.roomId).emit('roomGameUpdate', {
                gridPlayer1: playerA.grid,
                gridPlayer2: playerB.grid,
            });
        }

        console.log(`Game started in room ${player.roomId}`);
    }

    handleUserAction(socket, action) {
        const player = this.players.find(player => player.id === socket.id && player.roomId);
        const room = player && this.rooms[player.roomId];

        if (!player) {
            const error = `Player not found with socket ID ${socket.id}`;
            socket.emit("serverError", error);
            console.error(error);
            return;
        }

        if (!room) {
            const error = `Room not found for player ${player.id}`;
            socket.emit("serverError", error);
            console.error(error);
            return;
        }

        if (!room.players.includes(player.id)) {
            const error = `Player ${player.id} is not in the room ${room.id}`;
            socket.emit("serverError", error);
            console.error(error);
            return;
        }

        if (!player.isGameStart) {
            const error = `Game for player ${player.id} has not started yet`;
            socket.emit("serverError", error);
            console.error(error);
            return;
        }

        const rotatePieceLeft = (piece) => {
            const rotatedPiece = [];
            const rows = piece.length;
            const cols = piece[0].length;

            for (let col = cols - 1; col >= 0; col--) {
                const newRow = [];
                for (let row = 0; row < rows; row++) {
                    newRow.push(piece[row][col]);
                }
                rotatedPiece.push(newRow);
            }

            return rotatedPiece;
        };

        const rotatePieceRight = (piece) => {
            const rotatedPiece = [];
            const rows = piece.length;
            const cols = piece[0].length;

            for (let col = 0; col < cols; col++) {
                const newRow = [];
                for (let row = rows - 1; row >= 0; row--) {
                    newRow.push(piece[row][col]);
                }
                rotatedPiece.push(newRow);
            }

            return rotatedPiece;
        };

        player.removePieceToGrid();

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
                player.currentPiece.shape = rotatePieceLeft(player.currentPiece.shape);
                if (!player.isPieceCanMove()) {
                    player.currentPiece.shape = rotatePieceRight(player.currentPiece.shape);
                }
                break;
            case 'rotate-right':
                player.currentPiece.shape = rotatePieceRight(player.currentPiece.shape);
                if (!player.isPieceCanMove()) {
                    player.currentPiece.shape = rotatePieceLeft(player.currentPiece.shape);
                }
                break;
            default:
                break;
        }

        player.addPieceToGrid();

        const [playerA, playerB] = room.players.map(playerId => this.players.find(player => player.id === playerId));
        this.io.to(player.roomId).emit('roomGameUpdate', {
            gridPlayer1: playerA.grid,
            gridPlayer2: playerB.grid,
        });
    }

    handleKickPlayer(socket, playerId) {
        const player = this.players.find(player => player.id === socket.id);

        if (!player || !player.roomId || !this.rooms[player.roomId] || !playerId) {
            const error = `Invalid parameters for kicking player from room`;
            socket.emit("serverError", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        const room = this.rooms[player.roomId];
        if (!room || player.id !== room.host) {
            const error = `You are not the host of room ${player.roomId}`;
            socket.emit("serverError", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        const playerIndex = room.players.indexOf(playerId);
        if (playerIndex === -1) {
            const error = `Player ${playerId} is not in room ${player.roomId}`;
            socket.emit("serverError", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        if (playerId === room.host) {
            this.io.to(player.roomId).emit('roomLeft', player.roomId);
            this.closeRoom(player.roomId);
            console.log(`Host (${playerId}) kicked himself`);
        } else {
            const kickedPlayer = this.io.sockets.sockets.get(playerId);
            if (!kickedPlayer) return;

            kickedPlayer.leave(player.roomId);
            kickedPlayer.emit('roomLeft', player.roomId);

            room.players.splice(playerIndex, 1);
            this.io.to(player.roomId).emit('roomUpdate', room);
            this.players.find(p => p.id === playerId).roomId = null;
            console.log(`${playerId} kicked from room ${player.roomId}`);
        }
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
                // Logique pour gérer la déconnexion du client
                if (socket.id === room.host) {
                    // Si le joueur déconnecté est l'hôte de la salle
                    this.io.to(player.roomId).emit('roomLeft', player.roomId);
                    this.closeRoom(player.roomId);
                    console.log(`Host (${socket.id}) disconnected`);
                } else {
                    // Si le joueur déconnecté est un joueur normal
                    socket.leave(player.roomId);
                    room.players = room.players.filter(p => p !== socket.id);
                    this.io.to(player.roomId).emit('roomUpdate', room);
                    console.log(`${socket.id} left room ${player.roomId}`);
                }

                player.roomId = null;
            }
        }
        // Supprimer le joueur de la liste des joueurs
        this.players.splice(this.players.findIndex(player => player.id === socket.id), 1);
        console.log(`${socket.id} disconnected`);
    }

    generateRandomId(length = 6) {
        // Logique pour générer un identifiant de room aléatoire
        const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    closeRoom(roomId) {
        // Logique pour fermer une room
        const room = this.rooms[roomId];
        if (!room) {
            console.error(`Room ${roomId} does not exist.`);
            return;
        }

        room.players.forEach(playerId => {
            const player = this.players.find(player => player.id === playerId);
            if (!player) {
                console.error(`Player ${playerId} not found.`);
                return;
            }

            const playerSocket = this.io.sockets.sockets.get(playerId);
            if (!playerSocket) {
                console.error(`Socket for player ${playerId} not found.`);
                return;
            }

            playerSocket.leave(roomId);
            player.roomId = null;
        });

        delete this.rooms[roomId];
        console.log(`Room ${roomId} closed.`);
    }
}

module.exports = GameManager;
