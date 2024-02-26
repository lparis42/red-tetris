const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const { handleCreateLobby, handleJoinLobby, handleLeaveLobby, handleStartGame, handleUserAction, handleKickPlayer, handleDisconnect } = require('./lobbySocketHandlers');

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

const ROWS = 20;
const COLS = 10;

let players = [];

const initializePlayerData = (socketId) => {
    return {
        id: socketId,
        lobbyId: null,
        grid: Array.from({ length: ROWS }, () => Array(COLS).fill(0)),
        currentPiece: [],
        currentPosition: { row: 0, col: 0 },
        isGameStart: false,
        resetInterval: (() => {
            let interval = null;
            return {
                set(fn, time) {
                    clearInterval(interval);
                    interval = setInterval(fn, time);
                },
                clear() {
                    clearInterval(interval);
                }
            };
        })()
    };
};

const lobbies = {};

app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

io.on('connection', (socket) => {
    console.log(`${socket.id} connected`);
    players.push(initializePlayerData(socket.id));

    handleCreateLobby(socket, lobbies, players);
    handleJoinLobby(socket, lobbies, players, io);
    handleLeaveLobby(socket, lobbies, players, io);
    handleStartGame(socket, lobbies, players, io);
    handleUserAction(socket, lobbies, players, io);
    handleKickPlayer(socket, lobbies, players, io);

    socket.on('disconnect', () => {
        handleDisconnect(socket, lobbies, players, io);
        players = players.filter(p => p.id !== socket.id);
        console.log(`${socket.id} disconnected`);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});