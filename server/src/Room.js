// Room.js

class Room {
    constructor(leader, mode) {
        this.leader = leader;
        this.players = [leader];
        this.pieces = [];
        this.positions = [];
        this.mode = mode;
        this.active = false;
        this.cols = 10;
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
