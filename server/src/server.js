const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const GameManager = require('./GameManager');

const PORT = process.env.PORT || 80;

class Server {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIo(this.server, {
            cors: {
                origin: ["http://localhost:3000"/*, "http://red-tetris.ddns.net"*/],
                methods: ["GET", "POST"]
            }
        });
        this.gameManager = new GameManager(this.io);
        this.configureMiddleware();
        this.configureRoutes();
        this.start();
    }

    configureMiddleware() {
        // Middleware pour autoriser les requêtes CORS
        this.app.use((req, res, next) => {
            // Autoriser les requêtes depuis les domaines spécifiés
            res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000'/*, 'http://red-tetris.ddns.net'*/);
            // Autoriser les méthodes HTTP spécifiées
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
            // Autoriser les en-têtes spécifiés
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            // Poursuivre vers la prochaine étape du middleware
            next();
        });

        this.app.use(express.static(path.join(__dirname, '../..', 'client', 'build')));
    }

    configureRoutes() {
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../..', 'client', 'build', 'index.html'));
        });
    }

    start() {
        this.server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
}

new Server();
