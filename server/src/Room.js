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

    get mode()
    {
        return this.#mode;
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

    isGameRunning()
    {
        // Todo: Modify
        return this.getPlayers().some((player) => player.isGameStart);
    }

    addPlayer(player)
    {
        this.#players.add(player);
    }

    removePlayer(player)
    {
        this.#players.delete(player);

        if ( ! player.isRoomLeader(this) )
        {
            return ;
        }

        this.#leader = null;

        if ( ! this.isEmpty() )
        {
            this.#leader = this.#players.values().next().value;
        }
    }

    addPiece(piece, position) {
        this.pieces.push(piece);
        this.positions.push(position);
    }
}

module.exports = Room;
