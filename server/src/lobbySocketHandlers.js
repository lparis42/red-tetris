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


// Fonction pour générer un identifiant de lobby aléatoire
const generateRandomId = (length = 6) => {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

// Fonction pour fermer un lobby
const closeLobby = (lobbyId, players, io) => {
    if (io.sockets.adapter.rooms[lobbyId]) {

        // Obtenir les IDs des sockets dans le lobby
        const socketIds = io.sockets.adapter.rooms[lobbyId].sockets;

        // Déconnecter les joueurs du lobby
        socketIds.forEach(socketId => {
            const socket = io.sockets.sockets.get(socketId);
            socket.leave(lobbyId);
            players.find(player => player.id === socket.id).lobbyId = null;
        });

        delete lobbies[lobbyId];
    }
};

// Fonction pour gérer la création de lobby
const handleCreateLobby = (socket, lobbies, players, io) => {
    socket.on('createLobby', () => {
        // Vérifier si le joueur n'est pas déjà dans un lobby
        if (players.find(player => player.id === socket.id)?.lobbyId) {
            const error = 'You are already in a lobby';
            socket.emit("serverError", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        // Générer un ID de lobby aléatoire
        let lobbyId;
        do {
            lobbyId = generateRandomId();
        } while (lobbies[lobbyId]);

        socket.join(lobbyId);

        lobbies[lobbyId] = { host: socket.id, players: [socket.id] };
        players.find(player => player.id === socket.id).lobbyId = lobbyId;

        socket.emit('lobbyCreated', { id: lobbyId, players: lobbies[lobbyId].players });

        console.log(`${socket.id} created lobby ${lobbyId}`);
    });
};

// Fonction pour gérer la jointure de lobby
const handleJoinLobby = (socket, lobbies, players, io) => {
    socket.on('joinLobby', (lobbyId) => {
        // Vérifier si le joueur n'est pas déjà dans un lobby
        if (players.find(player => player.id === socket.id)?.lobbyId) {
            const error = 'You are already in a lobby';
            socket.emit("serverError", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        // Vérifier si le lobby existe
        const lobby = lobbies[lobbyId];
        if (!lobby) {
            const error = `Lobby not found with ID: ${lobbyId}`;
            socket.emit("serverError", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        // Vérifier si le lobby est plein
        if (lobby.players.length >= 2) {
            const error = `Lobby is full with ID: ${lobbyId}`;
            socket.emit("serverError", error);
            console.error(`${socket.id} : ${error}`);
            return;
        }

        socket.join(lobbyId);

        lobby.players.push(socket.id);
        players.find(player => player.id === socket.id).lobbyId = lobbyId;
        socket.emit("lobbyJoined", lobbyId);
        io.to(lobbyId).emit('lobbyUpdate', lobby);

        console.log(`${socket.id} joined lobby ${lobbyId}`);
    });
};

// Fonction pour gérer le départ de lobby
const handleLeaveLobby = (socket, lobbies, players, io) => {
    socket.on('leaveLobby', () => {
        // Vérifier si le joueur est dans un lobby et si le lobby existe
        const player = players.find(player => player.id === socket.id);
        if (!player || !player.lobbyId || !lobbies[player.lobbyId]) {
            const error = `You are not in any lobby or lobby does not exist`;
            socket.emit("serverError", error);
            console.log(`${socket.id} : ${error}`);
            return;
        }

        const { lobbyId } = player;
        const lobby = lobbies[lobbyId];
        const { players: lobbyPlayers, host } = lobby;
        const index = lobbyPlayers.indexOf(socket.id);

        if (index !== -1) {
            // Gérer le cas où le joueur est l'hôte du lobby
            if (socket.id === host) {
                io.to(lobbyId).emit('lobbyLeft', lobbyId);
                closeLobby(lobbyId, players, io);
                console.log(`Host (${socket.id}) left and closed lobby ${lobbyId}`);
            } else {
                // Gérer le cas où le joueur n'est pas l'hôte du lobby
                socket.leave(lobbyId);
                lobbyPlayers.splice(index, 1);
                io.to(lobbyId).emit('lobbyUpdate', lobby);
                socket.emit('lobbyLeft', lobbyId);
                console.log(`${socket.id} left lobby ${lobbyId}`);
            }
            player.lobbyId = null;
        } else {
            const error = `You are not in lobby ${lobbyId}`;
            socket.emit("serverError", error);
            console.log(`${socket.id} : ${error}`);
        }
    });
};

// Fonction pour gérer le démarrage du jeu dans un lobby
const handleStartGame = (socket, lobbies, players, io) => {
    socket.on('startGame', (lobbyId) => {
        // Vérifier si le lobby existe
        const lobby = lobbies[lobbyId];
        if (!lobby) {
            const error = `Lobby ${lobbyId} does not exist`;
            socket.emit("serverError", error);
            console.log(`${socket.id} : ${error}`);
            return;
        }

        // Vérifier si le joueur est l'hôte du lobby
        if (lobby.host !== socket.id) {
            const error = `You are not the host of lobby ${lobbyId}`;
            socket.emit("serverError", error);
            console.log(`${socket.id} : ${error}`);
            return;
        }

        const updateItervalFall = (player, players, lobby, io) => {
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
                player.resetInterval.set(() => updateItervalFall(player, players, lobby, io), 1000);
            } else {
                updateGrid(player.grid, player.currentPiece.shape, player.currentPosition, player.currentPiece.color);

                const [playerA, playerB] = lobby.players.map(playerId => players.find(p => p.id === playerId));

                io.to(player.lobbyId).emit('lobbyGameUpdate', {
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
                updateItervalFall(player, players, lobby, io);
            }, 1000);
        });

        io.to(lobbyId).emit('lobbyGameStart');

        console.log(`Game started in lobby ${lobbyId}`);
    });
};

// Fonction pour gérer l'action d'un joueur
const handleUserAction = (socket, lobbies, players, io) => {
    socket.on('userAction', (action) => {

        const player = players.find(player => player.id === socket.id && player.lobbyId);
        const lobby = player && lobbies[player.lobbyId];

        // Vérifier si le joueur et le lobby existent et si le joueur est dans ce lobby
        if (!player || !lobby || !lobby.players.includes(player.id)) return;

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

        const [playerA, playerB] = lobby.players.map(playerId => players.find(p => p.id === playerId));
        io.to(player.lobbyId).emit('lobbyGameUpdate', {
            gridPlayer1: playerA.grid,
            gridPlayer2: playerB.grid,
        });
    });
};


// Fonction pour gérer l'expulsion d'un joueur d'un lobby
const handleKickPlayer = (socket, lobbies, players, io) => {
    socket.on('kickPlayer', (lobbyId, playerId) => {
        // Vérifier si le lobby existe
        const lobby = lobbies[lobbyId];
        if (!lobby) {
            const error = `Lobby ${lobbyId} does not exist`;
            socket.emit("serverError", error);
            console.log(`${socket.id} : ${error}`);
            return;
        }

        // Vérifier si le joueur qui fait l'action est l'hôte
        if (socket.id !== lobby.host) {
            const error = `You are not the host of lobby ${lobbyId}`;
            socket.emit("serverError", error);
            console.log(`${socket.id} : ${error}`);
            return;
        }

        // Vérifier si le joueur à expulser est bien dans le lobby
        const player = players.find(player => player.id === playerId);
        if (!player) {
            const error = `Player ${playerId} doesn't exist`;
            socket.emit("serverError", error);
            console.log(`${socket.id} : ${error}`);
            return;
        }

        // Vérifier si le joueur à expulser est bien dans le lobby
        if (player.lobbyId !== lobbyId) {
            const error = `Player ${playerId} is not in lobby ${lobbyId}`;
            socket.emit("serverError", error);
            console.log(`${socket.id} : ${error}`);
            return;
        }

        const playerSocket = io.sockets.sockets.get(playerId);
        playerSocket.leave(lobbyId);
        players.find(p => p.id === playerId).lobbyId = null;
        lobby.players = lobby.players.filter(p => p !== playerId);

        io.to(lobbyId).emit('lobbyUpdate', lobby);
        playerSocket.emit('lobbyLeft', lobbyId);

        console.log(`${playerId} kicked from lobby ${lobbyId}`);
    });
};

// Fonction pour gérer la déconnexion d'un client
const handleDisconnect = (socket, lobbies, players, io) => {
    // Récupérer le joueur déconnecté
    const player = players.find(p => p.id === socket.id);
    if (!player || !player.lobbyId) return;

    const lobby = lobbies[player.lobbyId];
    if (!lobby) return;

    const { players: lobbyPlayers, host } = lobby;
    const index = lobbyPlayers.indexOf(socket.id);

    // Vérifier si le joueur déconnecté est dans la liste des joueurs du lobby
    if (index !== -1) {
        // Vérifier si le joueur déconnecté est l'hôte du lobby
        if (socket.id === host) {
            io.to(player.lobbyId).emit('lobbyLeft', player.lobbyId);
            closeLobby(player.lobbyId, players, io);
            console.log(`Host (${socket.id}) disconnected. Lobby ${player.lobbyId} closed`);
        } else {
            socket.leave(player.lobbyId);
            lobbyPlayers.splice(index, 1);
            io.to(player.lobbyId).emit('lobbyUpdate', lobby);
            players.find(p => p.id === socket.id).lobbyId = null;
            console.log(`${socket.id} left lobby ${player.lobbyId}`);
        }
    }
};

module.exports = {
    handleCreateLobby,
    handleJoinLobby,
    handleLeaveLobby,
    handleStartGame,
    handleUserAction,
    handleKickPlayer,
    handleDisconnect,
};
