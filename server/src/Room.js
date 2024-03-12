// Room.js

class Room {
    constructor(host, mode) {
        this.host = host;
        this.players = [host];
        this.pieces = [];
        this.positions = [];
        this.mode = mode;
    }

    addPlayer(playerId) {
        this.players.push(playerId);
    }

    removePlayer(playerId) {
        const index = this.players.indexOf(playerId);
        if (index !== -1) {
            this.players.splice(index, 1);
        }
    }

    addPiece(piece, position) {
        this.pieces.push(piece);
        this.positions.push(position);
    }
}

module.exports = Room;
