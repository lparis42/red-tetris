// Room.js
const Crypto = require('node:crypto');

const Modes = Object.freeze([ 'standard', 'expert' ]);

class Room
{
    #id;
    #mode;
    #leader;
    #players;

    constructor(leader, mode)
    {
        this.#id = Crypto.randomUUID();
        this.#mode = mode;
        this.#leader = leader;
        this.#players = new Set();

        this.players = [host];
        this.pieces = [];
        this.positions = [];
    }

    static isValidMode(mode)
    {
        return ( Modes.includes(mode) );
    }

    get id()
    {
        return this.#id;
    }

    getLeader()
    {
        return this.#leader;
    }

    getPlayers()
    {
        return Object.freeze([ ...this.#players ]);
    }

    isEmpty()
    {
        return ( this.#players.size === 0 );
    }

    isFull()
    {
        return ( this.#players.size >= 9 );
    }

    addPlayer(player)
    {
        this.#players.add(player);
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
