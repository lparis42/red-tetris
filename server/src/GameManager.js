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

        // Logique pour générer un identifiant de room aléatoire et unique
        let roomId;
        do {
            const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
            const length = 6;
            let result = '';
            for (let i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            roomId = result;
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


    // Fonction pour démarrer le jeu
    handleStartGame(socket) {
        // Trouver le joueur associé au socket
        const player = this.players.find(player => player.id === socket.id);

        // Vérifier si le joueur ou la salle est invalide
        if (!player || !player.roomId || !this.rooms[player.roomId]) {
            const error = `Joueur ou salle invalide`;
            socket.emit("serverError", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        // Récupérer la salle
        const room = this.rooms[player.roomId];

        // Vérifier si le joueur est l'hôte de la salle
        if (room.host !== socket.id) {
            const error = `Joueur invalide pour démarrer le jeu dans la salle ${player.roomId}`;
            socket.emit("serverError", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        // Fonction pour mettre à jour l'intervalle de chute des pièces
        const updateIntervalFall = (playerSocket, player, room, level, timer) => {
            // Retirer la pièce de la grille
            player.removePieceToGrid();
            // Déplacer la pièce vers le bas
            player.currentPosition.row += 1;

            // Vérifier si la pièce peut bouger vers le bas
            if (!player.isPieceCanMove()) {
                // Annuler le déplacement vers le bas
                player.currentPosition.row -= 1;
                // Ajouter la pièce à la grille
                player.addPieceToGrid();

                // Vérifier et supprimer les lignes complétées
                const penalty = player.removeCompletedLines();
                if (penalty > 1) {
                    // Récupérer les grilles des joueurs dans la salle, en excluant le joueur actuel
                    const playersInRoom = this.players.filter(otherPlayer => room.players.includes(otherPlayer.id) && otherPlayer.id !== player.id);
                    // Appliquer les pénalités
                    playersInRoom.forEach(otherPlayer => {
                        otherPlayer.addPenalty(penalty - 1);
                    });
                }

                // Vérifier si la première ligne est remplie
                if (player.isGameEnd()) {
                    // Émettre un événement de fin de partie
                    playerSocket.emit('roomGameEnd');
                    return;
                }

                // Augmenter le niveau
                level += 1;
                // Gérer le temps de chute en fonction du niveau
                if (!room.pieces[level]) {
                    const piece = new Piece();
                    const position = new Position(piece.shape);
                    room.addPiece(piece, position);
                }
                player.currentPiece = Object.create(room.pieces[level]);
                player.currentPosition = Object.create(room.positions[level]);
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
                // Réinitialiser l'intervalle de chute
                player.resetInterval.clear();
                player.resetInterval.set(() => {
                    // Mettre à jour l'intervalle de chute
                    updateIntervalFall(playerSocket, player, room, level, timer);
                }, timer);
            }

            // Ajouter la pièce à la grille
            player.addPieceToGrid();

            // Récupérer les joueurs dans la salle
            const playersInRoom = this.players.filter(player => room.players.includes(player.id));
            const gridsToUpdate = [];
            gridsToUpdate.unshift(player.grid);
            for (let i = 0; i < playersInRoom.length; i++) {
                if (playersInRoom[i] !== player) {
                    gridsToUpdate.push(playersInRoom[i].calculateSpectrum());
                }
            }
            // Émettre un événement de mise à jour de la salle
            playerSocket.emit('roomGameUpdate', gridsToUpdate);
        };

        // Créer une nouvelle pièce et position pour la salle
        const piece = new Piece();
        const position = new Position(piece.shape);
        room.addPiece(piece, position);

        // Récupérer les joueurs dans la salle
        const roomPlayers = this.players.filter(player => room.players.includes(player.id));
        // Démarrer le jeu pour chaque joueur dans la salle
        roomPlayers.forEach(player => {
            player.isGameStart = true;
            player.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
            player.currentPiece = Object.create(room.pieces[0]);
            player.currentPosition = Object.create(room.positions[0]);
            player.addPieceToGrid();

            // Définir l'intervalle de chute pour chaque joueur
            player.resetInterval.set(() => {
                const playerSocket = this.io.sockets.sockets.get(player.id);
                updateIntervalFall(playerSocket, player, room, 0, 800);
            }, 800);
        });

        // Récupérer les joueurs dans la salle
        const playersInRoom = this.players.filter(player => room.players.includes(player.id));
        const gridsToUpdate = [];
        gridsToUpdate.unshift(player.grid);
        for (let i = 0; i < playersInRoom.length; i++) {
            if (playersInRoom[i] !== player) {
                gridsToUpdate.push(playersInRoom[i].calculateSpectrum());
            }
        }
        // Émettre un événement de mise à jour de la salle
        socket.emit('roomGameUpdate', gridsToUpdate);

        // Émettre un événement de démarrage de jeu pour la salle
        this.io.to(player.roomId).emit('roomGameStart');

        // Afficher un message dans la console pour indiquer que le jeu a démarré
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
                // Logique pour déplacer instantanément la pièce vers le bas
                player.removePieceToGrid();
                while (player.isPieceCanMove()) {
                    player.currentPosition.row += 1;
                }
                player.currentPosition.row -= 1;
                player.addPieceToGrid();
                break;
            default:
                break;
        }

        // Récupérer les joueurs dans la salle
        const playersInRoom = this.players.filter(player => room.players.includes(player.id));
        const gridsToUpdate = [];
        gridsToUpdate.unshift(player.grid);
        for (let i = 0; i < playersInRoom.length; i++) {
            if (playersInRoom[i] !== player) {
                gridsToUpdate.push(playersInRoom[i].calculateSpectrum());
            }
        }
        // Émettre un événement de mise à jour de la salle
        socket.emit('roomGameUpdate', gridsToUpdate);
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
                    console.log(`Host ${socket.id} left room ${player.roomId}`);
                } else {
                    // Si le joueur déconnecté est un joueur normal
                    player.resetInterval.clear();
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
            } else {
                player.resetInterval.clear();
                player.roomId = null;
            }

            const playerSocket = this.io.sockets.sockets.get(playerId);
            if (!playerSocket) {
                console.error(`Socket for player ${playerId} not found.`);
            } else {
                playerSocket.leave(roomId);
            }

        });

        delete this.rooms[roomId];
        console.log(`Room ${roomId} closed.`);
    }
}

module.exports = GameManager;
