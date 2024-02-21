const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 1337;

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

let players = [];
const lobbies = {};

app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    players.push({ id: socket.id });
    io.emit('updatePlayerList', players);

    socket.on('createLobby', () => {
        const lobbyId = generateRandomId();
        lobbies[lobbyId] = { host: socket.id, players: [socket.id] };
        socket.join(lobbyId);
        socket.emit('lobbyCreated', { id: lobbyId, players: lobbies[lobbyId].players });
        console.log(`${socket.id} created lobby ${lobbyId}`);
    });

    socket.on('joinLobby', (lobbyId) => {
        if (!lobbies[lobbyId]) {
            socket.emit('lobbyNotFound', lobbyId);
            return;
        }

        const { players: lobbyPlayers } = lobbies[lobbyId];
        if (lobbyPlayers.length >= 2) {
            socket.emit('lobbyFull', lobbyId);
            return;
        }

        socket.emit('lobbyJoined', lobbyId);

        lobbyPlayers.push(socket.id);
        socket.join(lobbyId);
        io.to(lobbyId).emit('lobbyUpdate', lobbies[lobbyId]);

        console.log(`${socket.id} joined lobby ${lobbyId}`);
    });

    socket.on('leaveLobby', (lobbyId) => {
        if (lobbies[lobbyId]) {
            const { players, host } = lobbies[lobbyId];
            const index = players.indexOf(socket.id);
            if (index !== -1) {
                if (socket.id === host) {
                    io.to(lobbyId).emit('lobbyLeft', lobbyId);
                    const socketIdsInLobby = io.sockets.adapter.rooms.get(lobbyId);
                    for (const socketId of socketIdsInLobby) {
                        io.sockets.sockets.get(socketId).leave(lobbyId);
                    }
                    delete lobbies[lobbyId];
                } else {
                    players.splice(index, 1);
                    socket.leave(lobbyId);
                    io.to(lobbyId).emit('lobbyUpdate', lobbies[lobbyId]);
                    socket.emit('lobbyLeft', lobbyId);
                }
                console.log(`${socket.id} left lobby ${lobbyId}`);
            }
        }
    });

    socket.on('startGame', (lobbyId) => {
        if (lobbies[lobbyId] && lobbies[lobbyId].host === socket.id) {
            io.to(lobbyId).emit('gameStarted');
            console.log(`Game started in lobby ${lobbyId}`);
        }
    });

    socket.on('kickPlayer', (lobbyId, playerId) => {
        const lobby = lobbies[lobbyId];
        if (lobby && lobby.host === socket.id && lobby.host !== playerId) {
            const kickedSocket = io.sockets.sockets.get(playerId);
            if (kickedSocket) {
                const { players } = lobbies[lobbyId];
                const index = players.indexOf(playerId);
                if (index !== -1) {
                    players.splice(index, 1);
                    kickedSocket.emit('lobbyLeft', lobbyId);
                    kickedSocket.leave(lobbyId);
                    io.to(lobbyId).emit('lobbyUpdate', lobbies[lobbyId]);
                    console.log(`${playerId} kicked from lobby ${lobbyId}`);
                }
            }
        }
    });

    socket.on('disconnect', () => {

        players = players.filter(player => player.id !== socket.id);

        for (const lobbyId in lobbies) {
            const { players, host } = lobbies[lobbyId];
            const index = players.indexOf(socket.id);
            if (index !== -1) {
                if (socket.id === host) {
                    io.to(lobbyId).emit('lobbyLeft', lobbyId);
                    const socketIdsInLobby = io.sockets.adapter.rooms.get(lobbyId);
                    for (const socketId of socketIdsInLobby) {
                        io.sockets.sockets.get(socketId).leave(lobbyId);
                    }
                    delete lobbies[lobbyId];
                } else {
                    players.splice(index, 1);
                    socket.leave(lobbyId);
                    io.to(lobbyId).emit('lobbyUpdate', lobbies[lobbyId]);
                    socket.emit('lobbyLeft', lobbyId);
                }
                console.log(`${socket.id} left lobby ${lobbyId}`);
            }
        }
        console.log(`${socket.id} disconnected`);

    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

function generateRandomId(length = 6) {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
