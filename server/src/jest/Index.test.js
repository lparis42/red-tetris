const request = require('supertest');
const Server = require('../Server.js');
const runRoomTests = require('./Room.js');
const runPieceTests = require('./Piece.js');
const runPositionTests = require('./Position.js');
const runPlayerTests = require('./Player.js');

const runPlayerRenameTests = require('./PlayerRename.js');
const runRoomCreateTests = require('./RoomCreate.js');
const runRoomJoinTests = require('./RoomJoin.js');
const runRoomLeaveTests = require('./RoomLeave.js');
const runRoomKickTests = require('./RoomKick.js');
const runRoomGameStartTests = require('./RoomGameStart.js');
const runRoomGameActionTests = require('./RoomGameAction.js');


const runRoomListTests = require('./RoomList.js');


describe('server', () => {


    describe('GET /', () => {
        let server;

        beforeAll(() => {
            server = new Server();
        });

        afterAll(done => {
            server.closeServer(done);
        });

        it('should return index.html', async () => {
            const res = await request(server.app).get('/');
            expect(res.status).toBe(200);
            expect(res.text).toContain('<!doctype html>');
        });
    });

    runRoomTests();
    runPieceTests();
    runPositionTests();
    runPlayerTests();

    describe('GameManager', () => {

        runPlayerRenameTests();
        runRoomCreateTests();
        runRoomJoinTests();
        runRoomLeaveTests();
        runRoomKickTests();
        runRoomGameStartTests();
        runRoomGameActionTests();

        runRoomListTests();
    });
});

