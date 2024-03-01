const { ROWS, COLS, players, rooms, tetrisPieces } = require('./globals');
// Fonction pour générer une pièce aléatoire
const getRandomPiece = () => {
    const pieces = Object.values(tetrisPieces);
    const randomIndex = Math.floor(Math.random() * pieces.length);
    return { color: randomIndex + 1, shape: pieces[randomIndex] };
}

// Fonction pour générer une position aléatoire en haut du tableau
const getRandomStartPosition = (length) => {
    const col = Math.floor(Math.random() * (COLS - length + 1));
    return { row: 0, col };
};

// Fonction pour vérifier si la pièce peut être placée à la nouvelle position
const canMove = (currentPiece, currentPosition, grid) => {
    for (let r = 0; r < currentPiece.length; r++) {
        for (let c = 0; c < currentPiece[r].length; c++) {
            if (currentPiece[r][c]) {
                const newRow = currentPosition.row + r;
                const newCol = currentPosition.col + c;

                // Vérifier si la nouvelle position est en dehors des limites
                if (newRow >= ROWS || newCol < 0 || newCol > COLS) {
                    return false;
                }

                // Vérifier s'il y a collision avec un bloc existant
                if (grid[newRow][newCol] !== 0) {
                    return false;
                }
            }
        }
    }

    return true;
};

// Fonction pour vérifier et supprimer les lignes complètes
const checkAndRemoveCompletedLines = (grid) => {
    let completedLinesExist = true;

    while (completedLinesExist) {
        completedLinesExist = false;

        for (let row = 0; row < grid.length; row++) {
            let isCompleted = true;
            for (let col = 0; col < grid[row].length; col++) {
                if (grid[row][col] === 0) {
                    isCompleted = false;
                    break;
                }
            }
            if (isCompleted) {
                completedLinesExist = true;
                grid.splice(row, 1);
                grid.unshift(Array(COLS).fill(0));
                break;
            }
        }
    }
};



// Fonction pour mettre à jour la grille en fonction de la pièce actuelle
const updateGrid = (grid, piece, position, color) => {
    const { row, col } = position;

    piece.forEach((rowPiece, rowIndex) => {
        rowPiece.forEach((cell, colIndex) => {
            if (cell === 1) {
                grid[row + rowIndex][col + colIndex] = color;
            }
        });
    });
}

// Fonction pour générer un identifiant de room aléatoire
const generateRandomId = (length = 6) => {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

// Fonction pour fermer un room
const closeRoom = (roomId, io) => {
    const room = rooms[roomId];
    if (!room) {
        console.error(`Room ${roomId} does not exist.`);
        return;
    }

    room.players.forEach(playerId => {
        const player = players.find(player => player.id === playerId);
        if (!player) {
            console.error(`Player ${playerId} not found.`);
            return;
        }

        const playerSocket = io.sockets.sockets.get(playerId);
        if (!playerSocket) {
            console.error(`Socket for player ${playerId} not found.`);
            return;
        }

        playerSocket.leave(roomId);
        player.roomId = null;
    });

    delete rooms[roomId];
    console.log(`Room ${roomId} closed.`);
};

// Fonction pour gérer la création de room
const handleCreateRoom = (socket) => {
    socket.on('createRoom', () => {
        if (!socket) {
            console.error("Socket is not valid");
            return;
        }

        if (players.find(player => player.id === socket.id)?.roomId !== null) {
            const error = 'You are already in a room';
            socket.emit("serverError", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        let roomId;
        do {
            roomId = generateRandomId();
        } while (rooms[roomId]);

        socket.join(roomId);

        rooms[roomId] = { host: socket.id, players: [socket.id] };
        players.find(player => player.id === socket.id).roomId = roomId;

        socket.emit('roomCreated', { id: roomId, players: rooms[roomId].players });

        console.log(`${socket.id} created room ${roomId}`);
    });
};

// Fonction pour gérer la jointure de room
const handleJoinRoom = (socket, io) => {
    socket.on('joinRoom', (roomId) => {
        if (!socket || !roomId) {
            console.error("Socket or roomId is not valid");
            return;
        }

        if (players.find(player => player.id === socket.id)?.roomId !== null) {
            const error = 'You are already in a room';
            socket.emit("serverError", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        const room = rooms[roomId];
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

        room.players.push(socket.id);
        players.find(player => player.id === socket.id).roomId = roomId;
        socket.emit("roomJoined", roomId);
        io.to(roomId).emit('roomUpdate', room);

        console.log(`${socket.id} joined room ${roomId}`);
    });
};

// Fonction pour gérer le départ de room
const handleLeaveRoom = (socket, io) => {
    socket.on('leaveRoom', () => {
        const player = players.find(player => player.id === socket.id);
        if (!player || !player.roomId || !rooms[player.roomId]) {
            const error = `You are not in any room or room does not exist`;
            socket.emit("serverError", error);
            console.log(`${socket.id} : ${error}`);
            console.error(error);
            return;
        }

        const { roomId } = player;
        const room = rooms[roomId];
        const { players: roomPlayers, host } = room;
        const index = roomPlayers.indexOf(socket.id);

        if (index !== -1) {
            if (socket.id === host) {
                io.to(roomId).emit('roomLeft', roomId);
                closeRoom(roomId, io);
                console.log(`Host (${socket.id}) left and closed room ${roomId}`);
            } else {
                socket.leave(roomId);
                roomPlayers.splice(index, 1);
                io.to(roomId).emit('roomUpdate', room);
                socket.emit('roomLeft', roomId);
                console.log(`${socket.id} left room ${roomId}`);
            }
            player.roomId = null;
        } else {
            const error = `You are not in room ${roomId}`;
            socket.emit("serverError", error);
            console.log(`${socket.id} : ${error}`);
            console.error(error);
        }
    });
};
// Fonction pour gérer le démarrage du jeu dans un room
const handleStartGame = (socket, io) => {
    socket.on('startGame', () => {
        const player = players.find(player => player.id === socket.id);

        if (!player || !player.roomId || !rooms[player.roomId]) {
            const error = `Invalid player or room`;
            socket.emit("serverError", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        const room = rooms[player.roomId];
        if (room.players.length !== 2 || room.host !== socket.id) {
            const error = `Invalid conditions for starting game in room ${player.roomId}`;
            socket.emit("serverError", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        // Fonction pour gérer la descente automatique des pièces
        const updateIntervalFall = (player, io) => {
            if (!player.isGameStart) {
                player.resetInterval.clear();
                player.currentPiece = [];
                player.currentPosition = { row: 0, col: 0 };
                player.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
                return;
            }

            // Déplacer la pièce vers le bas d'une case
            updateGrid(player.grid, player.currentPiece.shape, player.currentPosition, 0);
            player.currentPosition.row += 1;

            // Vérifier si la pièce peut descendre d'une case
            if (!canMove(player.currentPiece.shape, player.currentPosition, player.grid)) {
                // Annuler le déplacement vers le bas de la pièce
                player.currentPosition.row -= 1;
                updateGrid(player.grid, player.currentPiece.shape, player.currentPosition, player.currentPiece.color);

                if (player.currentPosition.row > 0) {
                    checkAndRemoveCompletedLines(player.grid);
                }

                // Démarrer une nouvelle pièce
                player.currentPiece = getRandomPiece();
                player.currentPosition = getRandomStartPosition(player.currentPiece.shape[0].length);
                if (!canMove(player.currentPiece.shape, player.currentPosition, player.grid)) {
                    io.to(player.roomId).emit('roomGameEnd');
                    players.forEach(player => {
                        player.isGameStart = false;
                    });
                }
                else {
                    player.resetInterval.clear();
                    player.resetInterval.set(() => updateIntervalFall(player, io), 1000);
                }
            }

            // Ajouter la pièce à la grille
            updateGrid(player.grid, player.currentPiece.shape, player.currentPosition, player.currentPiece.color);

            // Transmettre les grilles des joueurs aux clients
            const [playerA, playerB] = players.map(player => player.id === player.id ? player : null);
            io.to(player.roomId).emit('roomGameUpdate', {
                gridPlayer1: playerA ? playerA.grid : [],
                gridPlayer2: playerB ? playerB.grid : [],
            });
        };

        players.forEach(player => {
            player.isGameStart = true;
            player.currentPiece = getRandomPiece();
            player.currentPosition = getRandomStartPosition(player.currentPiece.shape[0].length);
            updateGrid(player.grid, player.currentPiece.shape, player.currentPosition, player.currentPiece.color);

            player.resetInterval.set(() => {
                updateIntervalFall(player, io);
            }, 1000);
        });

        io.to(player.roomId).emit('roomGameStart');
        const [playerA, playerB] = room.players.map(playerId => players.find(player => player.id === playerId));

        io.to(player.roomId).emit('roomGameUpdate', {
            gridPlayer1: playerA.grid,
            gridPlayer2: playerB.grid,
        });

        console.log(`Game started in room ${player.roomId}`);
    });
};

// Fonction pour gérer l'action d'un joueur
const handleUserAction = (socket, io) => {
    socket.on('userAction', (action) => {
        const player = players.find(player => player.id === socket.id && player.roomId);
        const room = player && rooms[player.roomId];

        if (!player || !room || !room.players.includes(player.id) || player.isGameStart === false) {
            const error = `Invalid action received from user ${socket.id}`;
            socket.emit("serverError", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        console.log(`Received action from user ${socket.id}: ${action}`);

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

        updateGrid(player.grid, player.currentPiece.shape, player.currentPosition, 0);

        switch (action) {
            case 'move-left':
                player.currentPosition.col -= 1;
                if (!canMove(player.currentPiece.shape, player.currentPosition, player.grid)) {
                    player.currentPosition.col += 1;
                }
                break;
            case 'move-right':
                player.currentPosition.col += 1;
                if (!canMove(player.currentPiece.shape, player.currentPosition, player.grid)) {
                    player.currentPosition.col -= 1;
                }
                break;
            case 'move-down':
                player.currentPosition.row += 1;
                if (!canMove(player.currentPiece.shape, player.currentPosition, player.grid)) {
                    player.currentPosition.row -= 1;
                }
                break;
            case 'rotate-left':
                player.currentPiece.shape = rotatePieceLeft(player.currentPiece.shape);
                if (!canMove(player.currentPiece.shape, player.currentPosition, player.grid)) {
                    player.currentPiece.shape = rotatePieceRight(player.currentPiece.shape);
                }
                break;
            case 'rotate-right':
                player.currentPiece.shape = rotatePieceRight(player.currentPiece.shape);
                if (!canMove(player.currentPiece.shape, player.currentPosition, player.grid)) {
                    player.currentPiece.shape = rotatePieceLeft(player.currentPiece.shape);
                }
                break;
            default:
                break;
        }

        updateGrid(player.grid, player.currentPiece.shape, player.currentPosition, player.currentPiece.color);

        const [playerA, playerB] = room.players.map(playerId => players.find(player => player.id === playerId));
        io.to(player.roomId).emit('roomGameUpdate', {
            gridPlayer1: playerA.grid,
            gridPlayer2: playerB.grid,
        });
    });
};
// Fonction pour gérer l'expulsion d'un joueur d'un room
const handleKickPlayer = (socket, io) => {
    socket.on('kickPlayer', (playerId) => {
        const player = players.find(player => player.id === socket.id);

        if (!player || !player.roomId || !rooms[player.roomId] || !playerId) {
            const error = `Invalid parameters for kicking player from room`;
            socket.emit("serverError", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        const room = rooms[player.roomId];
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
            io.to(player.roomId).emit('roomLeft', player.roomId);
            closeRoom(player.roomId, io);
            console.log(`Host (${playerId}) kicked himself. Room ${player.roomId} closed`);
        } else {
            const playerSocket = io.sockets.sockets.get(playerId);
            if (!playerSocket) return;

            playerSocket.leave(player.roomId);
            playerSocket.emit('roomLeft', player.roomId);

            room.players.splice(playerIndex, 1);
            io.to(player.roomId).emit('roomUpdate', room);
            players.find(player => player.id === playerId).roomId = null;
            console.log(`${playerId} kicked from room ${player.roomId}`);
        }
    });
};

// Fonction pour gérer la déconnexion d'un client
const handleDisconnect = (socket, io) => {
    if (!socket) {
        console.error("Socket is not valid");
        return;
    }

    const player = players.find(player => player.id === socket.id);
    if (!player || !player.roomId || !rooms[player.roomId]) return;

    const room = rooms[player.roomId];
    if (!room) return;

    const { players: roomPlayers } = room;
    const index = roomPlayers.indexOf(socket.id);
    if (index === -1) return;

    if (socket.id === room.host) {
        io.to(player.roomId).emit('roomLeft', player.roomId);
        closeRoom(player.roomId, io);
        console.log(`Host (${socket.id}) disconnected. Room ${player.roomId} closed`);
    } else {
        socket.leave(player.roomId);
        roomPlayers.splice(index, 1);
        io.to(player.roomId).emit('roomUpdate', room);
        player.roomId = null;
        console.log(`${socket.id} left room ${player.roomId}`);
    }
};

module.exports = {
    handleCreateRoom,
    handleJoinRoom,
    handleLeaveRoom,
    handleStartGame,
    handleUserAction,
    handleKickPlayer,
    handleDisconnect,
};
