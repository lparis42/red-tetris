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
                origin: ["http://localhost:80", "http://localhost:3000"],
                methods: ['GET', 'POST']
            }
        });
        this.gameManager = new GameManager(this.io);
        this.configureMiddleware();
        this.configureRoutes();
        this.start();
    }

    configureMiddleware() {
        // Middleware pour servir les fichiers statiques depuis le dossier build
        this.app.use(express.static(path.join(__dirname, '../..', 'client', 'build')));
    }

    configureRoutes() {
        // Route pour servir le fichier index.html
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../..', 'client', 'build', 'index.html'));
        });
    }

    start() {
        // Démarrer le serveur sur le port spécifié
        this.server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }

    closeServer(done) {
        this.server.close(done);
    }
}

const serverInstance = new Server();

module.exports = Server;
