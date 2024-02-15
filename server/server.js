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

    // Exemple d'émission de message à un client connecté
    socket.emit('message', 'Hello from server!');

    // Ajouter le joueur à la liste des joueurs connectés
    players.push({ id: socket.id });

    // Envoyer la liste des joueurs aux clients dès qu'un joueur se connecte
    io.emit('updatePlayerList', players);

    // Gestion de l'événement "getPlayers" envoyé par un client
    socket.on('getPlayers', () => {
        // Émettre l'événement "updatePlayerList" avec la liste des joueurs
        io.emit('updatePlayerList', players);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');

        // Retirer le joueur de la liste des joueurs connectés
        players = players.filter(player => player.id !== socket.id);

        // Mettre à jour la liste des joueurs après la déconnexion
        io.emit('updatePlayerList', players);

    });
});


server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
