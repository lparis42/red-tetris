const ROWS = 20;
const COLS = 10;

const tetrisPieces = {
    O: [
        [1, 1],
        [1, 1]
    ],
    I: [
        [1],
        [1],
        [1],
        [1]
    ],
    L: [
        [1, 0],
        [1, 0],
        [1, 1]
    ],
    J: [
        [0, 1],
        [0, 1],
        [1, 1]
    ],
    T: [
        [1, 1, 1],
        [0, 1, 0]
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1]
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0]
    ]
};

const getRandomPiece = () => {
    const pieces = Object.values(tetrisPieces);
    const randomIndex = Math.floor(Math.random() * pieces.length);
    return { color: randomIndex + 1, shape: pieces[randomIndex] };
}


// Fonction pour générer une position aléatoire en haut du tableau
const getRandomStartPosition = (lenght) => {
    const col = Math.floor(Math.random() * (COLS - lenght + 1));
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
const closeRoom = (roomId, players, io) => {
    if (io.sockets.adapter.rooms[roomId]) {

        // Obtenir les IDs des sockets dans le room
        const socketIds = io.sockets.adapter.rooms[roomId].sockets;

        // Déconnecter les joueurs du room
        socketIds.forEach(socketId => {
            const socket = io.sockets.sockets.get(socketId);
            socket.leave(roomId);
            players.find(player => player.id === socket.id).roomId = null;
        });

        delete rooms[roomId];
    }
};

// Fonction pour gérer la création de room
const handleCreateRoom = (socket, rooms, players, io) => {
    socket.on('createRoom', () => {
        // Vérifier si le joueur n'est pas déjà dans un room
        if (players.find(player => player.id === socket.id)?.roomId) {
            const error = 'You are already in a room';
            socket.emit("serverError", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        // Générer un ID de room aléatoire
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
const handleJoinRoom = (socket, rooms, players, io) => {
    socket.on('joinRoom', (roomId) => {
        // Vérifier si le joueur n'est pas déjà dans un room
        if (players.find(player => player.id === socket.id)?.roomId) {
            const error = 'You are already in a room';
            socket.emit("serverError", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        // Vérifier si le room existe
        const room = rooms[roomId];
        if (!room) {
            const error = `Room not found with ID: ${roomId}`;
            socket.emit("serverError", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        // Vérifier si le room est plein
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
const handleLeaveRoom = (socket, rooms, players, io) => {
    socket.on('leaveRoom', () => {
        // Vérifier si le joueur est dans un room et si le room existe
        const player = players.find(player => player.id === socket.id);
        if (!player || !player.roomId || !rooms[player.roomId]) {
            const error = `You are not in any room or room does not exist`;
            socket.emit("serverError", error);
            console.log(`${socket.id} : ${error}`);
            return;
        }

        const { roomId } = player;
        const room = rooms[roomId];
        const { players: roomPlayers, host } = room;
        const index = roomPlayers.indexOf(socket.id);

        if (index !== -1) {
            // Gérer le cas où le joueur est l'hôte du room
            if (socket.id === host) {
                io.to(roomId).emit('roomLeft', roomId);
                closeRoom(roomId, players, io);
                console.log(`Host (${socket.id}) left and closed room ${roomId}`);
            } else {
                // Gérer le cas où le joueur n'est pas l'hôte du room
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
        }
    });
};

// Fonction pour gérer le démarrage du jeu dans un room
const handleStartGame = (socket, rooms, players, io) => {
    socket.on('startGame', (roomId) => {
        // Vérifier si le room existe
        const room = rooms[roomId];
        if (!room) {
            const error = `Room ${roomId} does not exist`;
            socket.emit("serverError", error);
            console.log(`${socket.id} : ${error}`);
            return;
        }

        // Vérifier si le joueur est l'hôte du room
        if (room.host !== socket.id) {
            const error = `You are not the host of room ${roomId}`;
            socket.emit("serverError", error);
            console.log(`${socket.id} : ${error}`);
            return;
        }

        const updateItervalFall = (player, players, room, io) => {
            updateGrid(player.grid, player.currentPiece.shape, player.currentPosition, 0);

            player.currentPosition.row += 1;
            console.log("Position :", player.currentPosition);
            // Vérifier si la pièce peut descendre d'une case
            if (!canMove(player.currentPiece.shape, player.currentPosition, player.grid)) {
                player.currentPosition.row -= 1;
                updateGrid(player.grid, player.currentPiece.shape, player.currentPosition, player.currentPiece.color);

                player.currentPiece = getRandomPiece();
                player.currentPosition = getRandomStartPosition(player.currentPiece.shape[0].length);

                player.resetInterval.clear();
                player.resetInterval.set(() => updateItervalFall(player, players, room, io), 1000);
            } else {
                updateGrid(player.grid, player.currentPiece.shape, player.currentPosition, player.currentPiece.color);

                const [playerA, playerB] = room.players.map(playerId => players.find(p => p.id === playerId));

                io.to(player.roomId).emit('roomGameUpdate', {
                    gridPlayer1: playerA.grid,
                    gridPlayer2: playerB.grid,
                });
            }
        };

        players.forEach(player => {
            player.currentPiece = getRandomPiece();
            player.currentPosition = getRandomStartPosition(player.currentPiece.shape[0].length);
            updateGrid(player.grid, player.currentPiece.shape, player.currentPosition, player.currentPiece.color);

            player.resetInterval.set(() => {
                updateItervalFall(player, players, room, io);
            }, 1000);
        });

        io.to(roomId).emit('roomGameStart');

        console.log(`Game started in room ${roomId}`);
    });
};

// Fonction pour gérer l'action d'un joueur
const handleUserAction = (socket, rooms, players, io) => {
    socket.on('userAction', (action) => {

        const player = players.find(player => player.id === socket.id && player.roomId);
        const room = player && rooms[player.roomId];

        // Vérifier si le joueur et le room existent et si le joueur est dans ce room
        if (!player || !room || !room.players.includes(player.id)) return;

        // Afficher l'action du joueur
        console.log(`Received action from user ${socket.id}: ${action}`);

        // Logique pour faire pivoter une pièce vers la gauche
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

        // Logique pour faire pivoter une pièce vers la droite
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

        // Mettre à jour la position et la forme de la pièce en fonction de l'action
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

        const [playerA, playerB] = room.players.map(playerId => players.find(p => p.id === playerId));
        io.to(player.roomId).emit('roomGameUpdate', {
            gridPlayer1: playerA.grid,
            gridPlayer2: playerB.grid,
        });
    });
};


// Fonction pour gérer l'expulsion d'un joueur d'un room
const handleKickPlayer = (socket, rooms, players, io) => {
    socket.on('kickPlayer', (roomId, playerId) => {
        // Vérifier si le room existe
        const room = rooms[roomId];
        if (!room) {
            const error = `Room ${roomId} does not exist`;
            socket.emit("serverError", error);
            console.log(`${socket.id} : ${error}`);
            return;
        }

        // Vérifier si le joueur qui fait l'action est l'hôte
        if (socket.id !== room.host) {
            const error = `You are not the host of room ${roomId}`;
            socket.emit("serverError", error);
            console.log(`${socket.id} : ${error}`);
            return;
        }

        // Vérifier si le joueur à expulser est bien dans le room
        const player = players.find(player => player.id === playerId);
        if (!player) {
            const error = `Player ${playerId} doesn't exist`;
            socket.emit("serverError", error);
            console.log(`${socket.id} : ${error}`);
            return;
        }

        // Vérifier si le joueur à expulser est bien dans le room
        if (player.roomId !== roomId) {
            const error = `Player ${playerId} is not in room ${roomId}`;
            socket.emit("serverError", error);
            console.log(`${socket.id} : ${error}`);
            return;
        }

        const playerSocket = io.sockets.sockets.get(playerId);
        playerSocket.leave(roomId);
        players.find(p => p.id === playerId).roomId = null;
        room.players = room.players.filter(p => p !== playerId);

        io.to(roomId).emit('roomUpdate', room);
        playerSocket.emit('roomLeft', roomId);

        console.log(`${playerId} kicked from room ${roomId}`);
    });
};

// Fonction pour gérer la déconnexion d'un client
const handleDisconnect = (socket, rooms, players, io) => {
    // Récupérer le joueur déconnecté
    const player = players.find(p => p.id === socket.id);
    if (!player || !player.roomId) return;

    const room = rooms[player.roomId];
    if (!room) return;

    const { players: roomPlayers, host } = room;
    const index = roomPlayers.indexOf(socket.id);

    // Vérifier si le joueur déconnecté est dans la liste des joueurs du room
    if (index !== -1) {
        // Vérifier si le joueur déconnecté est l'hôte du room
        if (socket.id === host) {
            io.to(player.roomId).emit('roomLeft', player.roomId);
            closeRoom(player.roomId, players, io);
            console.log(`Host (${socket.id}) disconnected. Room ${player.roomId} closed`);
        } else {
            socket.leave(player.roomId);
            roomPlayers.splice(index, 1);
            io.to(player.roomId).emit('roomUpdate', room);
            players.find(p => p.id === socket.id).roomId = null;
            console.log(`${socket.id} left room ${player.roomId}`);
        }
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
