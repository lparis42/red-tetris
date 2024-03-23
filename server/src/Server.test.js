const request = require('supertest');
const Server = require('./Server');

describe('server', () => {
    let server;

    beforeAll(() => {
        server = new Server().server; // Accès à l'instance du serveur HTTP
    });

    afterAll(done => {
        server.close(done); // Fermeture du serveur HTTP
    });

    describe('GET /', () => {
        it('should return index.html', async () => {
            const res = await request(server).get('/'); // Utilisation de request avec l'instance du serveur HTTP
            expect(res.status).toBe(200);
            // Vérifiez si la réponse contient des balises HTML ou d'autres éléments spécifiques
            expect(res.text).toContain('<html');
            expect(res.text).toContain('<title>React App</title>');
            // Ajoutez d'autres vérifications en fonction de la structure de votre page index.html
        });
    });

    // Ajoutez d'autres cas de test au besoin pour vos routes et fonctionnalités de serveur
});
