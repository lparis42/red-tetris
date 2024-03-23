const request = require('supertest');
const Server = require('./Server');

describe('server', () => {
    let server;

    beforeAll(() => {
        server = new Server();
    });

    afterAll(done => {
        server.closeServer(done);
    });


    // Ajoutez d'autres cas de test au besoin pour vos routes et fonctionnalités de serveur
});
