const Player = require('../Player');

const generateNewConnections = (server, numConnections) => {
    const newSockets = [];
    for (let i = 0; i < numConnections; i++) {
        const randomId = Math.random().toString(36).substring(7); // Générer un identifiant aléatoire
        const socket = {
            id: randomId,
            join: jest.fn(),
            leave: jest.fn(),
            emit: jest.fn()
        }; // Créer un nouvel objet socket simulé
        server.io.sockets.sockets.set(randomId, socket); // Ajouter le nouvel objet socket à la liste des sockets du serveur
        server.gameManager.players.push(new Player(socket.id)); // Ajouter le nouveau joueur à la liste des joueurs
        newSockets.push(socket); // Ajouter le nouvel objet socket à la liste des nouvelles connexions
    }
    return newSockets; // Retourner la liste des nouveaux objets socket
};


module.exports = generateNewConnections;