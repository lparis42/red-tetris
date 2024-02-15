// server.js
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

let players = [];

app.use(express.static(path.join(__dirname, '..', 'client', 'build')));


io.on('connection', (socket) => {
    console.log('Client connected');

    // Exemple d'�mission de message � un client connect�
    socket.emit('message', 'Hello from server!');

    // Ajouter le joueur � la liste des joueurs connect�s
    players.push({ id: socket.id });

    // Envoyer la liste des joueurs aux clients d�s qu'un joueur se connecte
    io.emit('updatePlayerList', players);

    // Gestion de l'�v�nement "getPlayers" envoy� par un client
    socket.on('getPlayers', () => {
        // �mettre l'�v�nement "updatePlayerList" avec la liste des joueurs
        io.emit('updatePlayerList', players);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');

        // Retirer le joueur de la liste des joueurs connect�s
        players = players.filter(player => player.id !== socket.id);

        // Mettre � jour la liste des joueurs apr�s la d�connexion
        io.emit('updatePlayerList', players);

    });
});


server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
