// app.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const { ROWS, COLS, players } = require('./globals'); // Utiliser la même instance de `players`
const { handleCreateRoom, handleJoinRoom, handleLeaveRoom, handleStartGame, handleUserAction, handleKickPlayer, handleDisconnect } = require('./roomSocketHandlers');

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

app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

const getPlayerObject = (socketId) => {
    return {
        id: socketId,
        roomId: null,
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

io.on('connection', (socket) => {
    console.log(`${socket.id} connected`);
    players.push(getPlayerObject(socket.id));
    console.log("Taille de players après ajout :", players.length);

    handleCreateRoom(socket);
    handleJoinRoom(socket, io);
    handleLeaveRoom(socket, io);
    handleStartGame(socket, io);
    handleUserAction(socket, io);
    handleKickPlayer(socket, io);

    socket.on('disconnect', () => {
        handleDisconnect(socket, io);

        // Ne réassignez pas la variable `players` ici
        players.splice(players.findIndex(player => player.id === socket.id), 1);
        
        
        console.log("Taille de players après filtrage :", players.length);

        console.log(`${socket.id} disconnected`);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
