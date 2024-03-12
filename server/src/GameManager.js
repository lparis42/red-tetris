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

            socket.on('tetris:room:create', (mode) => this.handleRoomCreate(socket, mode));
            socket.on('tetris:room:join', (roomId) => this.handleRoomJoin(socket, roomId));
            socket.on('tetris:room:leave', () => this.handleRoomLeave(socket));
            socket.on('tetris:room:game:start', () => this.handleRoomGameStart(socket));
            socket.on('tetris:room:game:action', (action) => this.handleRoomGameAction(socket, action));
            socket.on('tetris:player:rename', (newName) => this.handlePlayerRename(socket, newName));
            socket.on('tetris:room:list', (roomId) => this.handleRoomList(socket, roomId));
            socket.on('tetris:room:kick', (playerId) => this.handleRoomKick(socket, playerId));
            socket.on('disconnect', () => this.handleDisconnect(socket));
        });
    }

    handleRoomCreate(socket, mode) {

        // Vérifier si le joueur existe
        const player = this.players.find(player => player.id === socket.id);
        if (!player) {
            const error = 'Player not found';
            socket.emit("tetris:room:create", null, error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        // Vérifier si le joueur est déjà dans une salle
        if (player.roomId !== null) {
            const error = 'You are already in a room';
            socket.emit("tetris:room:create", null, error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        // Vérifier si le mode est valide (STANDARD ou EXPERT)
        if (mode !== 'STANDARD' && mode !== 'EXPERT') {
            const error = 'Invalid room mode';
            socket.emit("tetris:room:create", null, error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        // Logique pour générer un identifiant de room aléatoire et unique
        let roomId;
        do {
            roomId = Array.from({ length: 6 }, () => Math.random().toString(36).charAt(2)).join('');
        } while (this.rooms[roomId]);

        const room = new Room(socket.id, mode);
        this.rooms[roomId] = room;
        player.roomId = roomId;

        socket.join(roomId);
        socket.emit('tetris:room:create', roomId, null);

        console.log(`${socket.id} created room ${roomId}`);
    }


    handleRoomJoin(socket, roomId) {

        // Vérifier si l'ID de la salle est spécifié
        if (!roomId) {
            const error = 'Room ID is required';
            socket.emit("tetris:room:join", null, error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        // Vérifier si le joueur existe
        const player = this.players.find(player => player.id === socket.id);
        if (!player) {
            const error = 'Player not found';
            socket.emit("tetris:room:join", roomId, error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        // Vérifier si la salle existe
        const room = this.rooms[roomId];
        if (!room) {
            const error = `Room not found with ID: ${roomId}`;
            socket.emit("tetris:room:join", roomId, error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        // Vérifier si la salle est pleine (max 9 joueurs)
        if (room.players.length >= 9) {
            const error = 'Room is full';
            socket.emit("tetris:room:join", roomId, error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        // Vérifier si le joueur est déjà dans une salle
        if (player.roomId !== null) {
            // Si oui, quitter cette salle
            this.handleLeaveRoom(socket);

            // Vérifier si le joueur est toujours dans une salle
            if (player.roomId !== null) {
                return;
            }
        }

        room.addPlayer(player.id, player.name);
        player.roomId = roomId;

        socket.join(roomId);
        socket.emit("tetris:room:join", roomId, null);

        const playerNames = room.players.map(playerId => this.players.find(p => p.id === playerId).name);
        this.io.to(roomId).emit('tetris:room:update', playerNames);

        console.log(`${socket.id} joined room ${roomId}`);
    }



    handleRoomLeave(socket) {

        // Vérifier si le joueur existe
        const player = this.players.find(player => player.id === socket.id);
        if (!player) {
            const error = `Player not found`;
            socket.emit("tetris:room:leave", null, error);
            console.log(`${socket.id} : ${error}`);
            console.error(error);
            return;
        }

        // Vérifier si le joueur est dans une salle
        if (!player.roomId) {
            const error = `You are not in any room`;
            socket.emit("tetris:room:leave", player.name, error);
            console.log(`${socket.id} : ${error}`);
            console.error(error);
            return;
        }

        // Vérifier si la salle existe
        if (!this.rooms[player.roomId]) {
            const error = `Room ${player.roomId} does not exist`;
            socket.emit("tetris:room:leave", player.name, error);
            console.log(`${socket.id} : ${error}`);
            console.error(error);
            return;
        }

        const room = this.rooms[player.roomId];
        const index = room.players.indexOf(socket.id);

        // Vérifier si le joueur est dans la salle
        if (index === -1) {
            const error = `You are not in room ${player.roomId}`;
            socket.emit("tetris:room:leave", player.name, error);
            console.log(`${socket.id} : ${error}`);
            console.error(error);
            return;
        }

        // Si le joueur est l'hôte de la salle, fermer la salle
        if (socket.id === room.host) {
            // Fermer la room
            room.players.forEach(playerId => {
                const currentPlayer = this.players.find(player => player.id === playerId);
                if (!currentPlayer) {
                    console.error(`Player ${playerId} not found.`);
                } else {
                    currentPlayer.resetInterval.clear();
                    currentPlayer.roomId = null;
                }

                const playerSocket = this.io.sockets.sockets.get(playerId);
                if (!playerSocket) {
                    console.error(`Socket for player ${playerId} not found.`);
                } else {
                    playerSocket.emit('tetris:room:leave', `Host (${player.name})`, null);
                    playerSocket.leave(roomId);
                }
            });
            delete this.rooms[roomId];
            console.log(`Room ${roomId} closed.`);
            console.log(`Host (${socket.id}) left room ${player.roomId}`);
        } else {
            // Sinon, simplement retirer le joueur de la salle
            socket.leave(player.roomId);
            room.removePlayer(socket.id);
            const playerNames = room.players.map(playerId => this.players.find(p => p.id === playerId).name);
            this.io.to(roomId).emit('tetris:room:update', playerNames);
            socket.emit('tetris:room:leave', player.name, null);
            console.log(`${socket.id} left room ${player.roomId}`);
        }

        // Réinitialiser l'ID de la salle du joueur
        player.roomId = null;
    }

    // Fonction pour démarrer le jeu
    handleRoomGameStart(socket) {

        // Vérifier si le joueur existe
        const player = this.players.find(player => player.id === socket.id);
        if (!player) {
            const error = `Player not found`;
            socket.emit("tetris:room:game:start", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        // Vérifier si le joueur est dans une salle
        if (!player.roomId) {
            const error = `You are not in any room`;
            socket.emit("tetris:room:game:start", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        // Vérifier si la salle existe
        if (!this.rooms[player.roomId]) {
            const error = `Room does not exist`;
            socket.emit("tetris:room:game:start", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        const room = this.rooms[player.roomId];

        // Vérifier si le joueur est dans la salle
        const index = room.players.indexOf(socket.id);
        if (index === -1) {
            const error = `You are not in the room`;
            socket.emit("tetris:room:game:start", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        // Vérifier si le jeu a déjà commencé dans la salle
        if (player.isGameStart) {
            const error = `Game already started`;
            socket.emit("tetris:room:game:start", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        // Fonction pour mettre à jour l'intervalle de chute des pièces
        const updateIntervalFall = (playerSocket, player, room, level, timer) => {
            // Retirer la pièce de la grille
            player.removePieceToGrid();

            player.addPenalty();

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
                        otherPlayer.penalty += penalty - 1;
                    });
                }

                // Vérifier si la première ligne est remplie
                if (player.isGameEnd()) {
                    // Émettre un événement de fin de partie
                    playerSocket.emit('tetris:room:game:end');
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
                // Réinitialiser l'intervalle de chute
                player.resetInterval.clear();
                player.resetInterval.set(() => {
                    // Mettre à jour l'intervalle de chute
                    updateIntervalFall(playerSocket, player, room, level, timer);
                }, timer);
            }

            // Ajouter la pièce à la grille
            player.addPieceToGrid();

            // Mettre à jour les grilles des joueurs dans la salle
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

        // Mettre à jour les grilles des joueurs dans la salle
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

        // Émettre un événement de démarrage de jeu pour la salle
        this.io.to(player.roomId).emit("tetris:room:game:start", null);

        // Afficher un message dans la console pour indiquer que le jeu a démarré
        console.log(`Game started in room ${player.roomId}`);
    }


    handleRoomGameAction(socket, action) {

        // Vérifier si l'action est valide
        if (!['move-left', 'move-right', 'move-down', 'move-space', 'rotate-left', 'rotate-right'].includes(action)) {
            const error = `Invalid action`;
            socket.emit("tetris:room:game:action", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        // Vérifier si le joueur existe
        const player = this.players.find(player => player.id === socket.id && player.roomId);
        if (!player) {
            const error = `Player not found`;
            socket.emit("tetris:room:game:action", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        // Vérifier si la salle existe
        const room = player && this.rooms[player.roomId];
        if (!room) {
            const error = `Room not found`;
            socket.emit("tetris:server:error", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        // Vérifier si le joueur est dans la salle
        if (!room.players.includes(player.id)) {
            const error = `Player is not in the room ${room.id}`;
            socket.emit("tetris:server:error", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        // Vérifier si le jeu a commencé
        if (!player.isGameStart) {
            const error = `Game has not started yet`;
            socket.emit("tetris:server:error", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

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

        // Mettre à jour les grilles des joueurs dans la salle
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

    handlePlayerRename(socket, newName) {

        // Vérification si le joueur existe
        const player = this.players.find(player => player.id === socket.id);
        if (!player) {
            const error = `Player not found.`;
            socket.emit("tetris:player:rename", newName, error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        // Vérification de la longueur du nouveau nom
        if (newName.length < 1 || newName.length > 8) {
            const error = "Name must be between 1 and 8 characters long.";
            socket.emit("tetris:player:rename", newName, error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        // Vérification des caractères autorisés dans le nouveau nom
        const allowedCharacters = /^[a-zA-Z0-9]+$/;
        if (!allowedCharacters.test(newName)) {
            const error = "Name can only contain alphabets (uppercase or lowercase) and numbers.";
            socket.emit("tetris:player:rename", newName, error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        // Vérification de l'unicité du nouveau nom choisi
        if (this.players.some(p => p.name === newName)) {
            const error = `The name "${newName}" is already in use by another player`;
            socket.emit("tetris:player:rename", newName, error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        player.name = newName;
        socket.emit('tetris:player:rename', newName, null);

        console.log(`${socket.id} has been renamed to ${newName}`);
    }

    handleRoomList(socket, roomId) {

        // Vérifier si un préfixe est spécifié
        let filteredRooms = Object.values(this.rooms);
        if (roomId && roomId.trim() !== '') {
            filteredRooms = filteredRooms.filter(room => room.id.startsWith(roomId));
        }

        const roomList = filteredRooms.map(room => ({ id: room.id, mode: room.mode }));
        socket.emit('tetris:room:list', roomList);

        console.log(`Room list sent to ${socket.id}`);
    }


    handleRoomKick(socket, playerId) {

        // Vérification si playerId est vide
        if (!playerId) {
            const error = `Invalid playerId`;
            socket.emit("tetris:room:kick", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        // Vérification si le joueur n'est pas trouvé
        const player = this.players.find(player => player.id === socket.id);
        if (!player) {
            const error = `Player not found`;
            socket.emit("tetris:room:kick", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        // Vérification si le joueur n'est pas dans une salle
        if (!player.roomId) {
            const error = `Player is not in any room`;
            socket.emit("tetris:room:kick", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        // Vérification si la salle associée au joueur existe
        const room = this.rooms[player.roomId];
        if (!room) {
            const error = `Room ${player.roomId} not found`;
            socket.emit("tetris:room:kick", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        // Vérification si le joueur est l'hôte de la salle
        if (player.id !== room.host) {
            const error = `You are not the host of room ${player.roomId}`;
            socket.emit("tetris:room:kick", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        const playerIndex = room.players.indexOf(playerId);

        // Vérification si le joueur à expulser n'est pas dans la salle
        if (playerIndex === -1) {
            const error = `Player ${playerId} is not in room ${player.roomId}`;
            socket.emit("tetris:room:kick", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        if (playerId === room.host) {
            // Logique pour fermer une room
            room.players.forEach(playerId => {
                const currentPlayer = this.players.find(player => player.id === playerId);
                if (!currentPlayer) {
                    console.error(`Player ${playerId} not found.`);
                } else {
                    currentPlayer.resetInterval.clear();
                    currentPlayer.roomId = null;
                }

                const playerSocket = this.io.sockets.sockets.get(playerId);
                if (!playerSocket) {
                    console.error(`Socket for player ${playerId} not found.`);
                } else {
                    playerSocket.emit('tetris:room:leave', `Host (${player.name})`, null);
                    playerSocket.leave(roomId);
                }
            });
            delete this.rooms[roomId];

            console.log(`Room ${roomId} closed.`);
            console.log(`Host (${playerId}) kicked himself`);
        } else {
            const playerSocket = this.io.sockets.sockets.get(playerId);
            if (!playerSocket) return;

            playerSocket.leave(player.roomId);
            playerSocket.emit('tetris:room:leave', playerId, null);

            room.players.splice(playerIndex, 1);
            const playerNames = room.players.map(playerId => this.players.find(p => p.id === playerId).name);
            this.io.to(roomId).emit('tetris:room:update', playerNames);
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

                    // Logique pour fermer une room
                    room.players.forEach(playerId => {
                        const currentPlayer = this.players.find(player => player.id === playerId);
                        if (!currentPlayer) {
                            console.error(`Player ${playerId} not found.`);
                        } else {
                            currentPlayer.resetInterval.clear();
                            currentPlayer.roomId = null;
                        }

                        const playerSocket = this.io.sockets.sockets.get(playerId);
                        if (!playerSocket) {
                            console.error(`Socket for player ${playerId} not found.`);
                        } else {
                            playerSocket.emit('tetris:room:leave', `Host (${player.name})`, null);
                            playerSocket.leave(roomId);
                        }
                    });
                    delete this.rooms[roomId];
                    console.log(`Room ${roomId} closed.`);

                    console.log(`Host ${socket.id} left room ${player.roomId}`);
                } else {
                    // Si le joueur déconnecté est un joueur normal
                    player.resetInterval.clear();
                    socket.leave(player.roomId);
                    room.players = room.players.filter(p => p !== socket.id);
                    const playerNames = room.players.map(playerId => this.players.find(p => p.id === playerId).name);
                    this.io.to(roomId).emit('tetris:room:update', playerNames);
                    console.log(`${socket.id} left room ${player.roomId}`);
                }
            }
        }
        // Supprimer le joueur de la liste des joueurs
        this.players.splice(this.players.findIndex(player => player.id === socket.id), 1);
        console.log(`${socket.id} disconnected`);
    }
}

module.exports = GameManager;
