// Importations nécessaires
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const GameManager = require('./GameManager');

// Port sur lequel le serveur écoutera
const PORT = process.env.PORT || 80;

// Classe du serveur
class Server {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = require('socket.io')(this.server);
        this.configureMiddleware();
        this.configureRoutes();
        this.start();
    }

    configureMiddleware() {
        // Middleware pour autoriser les requêtes CORS et initialiser socket.io et GameManager
        this.app.use((req, res, next) => {
            // Autoriser les requêtes depuis les domaines spécifiés
            res.setHeader('Access-Control-Allow-Origin', 'http://localhost', 'http://localhost:3000');
            // Autoriser les méthodes HTTP spécifiées
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
            // Autoriser les en-têtes spécifiés
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            
            try {
                // Ajouter l'objet io à l'objet de la requête
                req.io = this.io;
        
                // Initialiser le GameManager avec l'instance de socket.io
                req.gameManager = new GameManager(req.io);
            } catch (error) {
                console.error('Error initializing socket.io:', error);
            }
    
            // Passer la requête au prochain middleware
            next();
        });
    
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
}

// Créer une instance du serveur
new Server();
