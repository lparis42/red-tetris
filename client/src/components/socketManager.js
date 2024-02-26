// socketManager.js

import React, { useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';

import { Tetris } from './tetrisManager.js'

const socket = socketIOClient("http://localhost:1337");

export const useKeyboardEvents = () => {
    useEffect(() => {
        const handlePlayerAction = (actionType) => {
            console.log(socket.id, actionType);
            socket.emit('userAction', actionType);
        };

        const handleKeyDown = (event) => {
            switch (event.key) {
                case 'q':
                    handlePlayerAction('move-left');
                    break;
                case 'd':
                    handlePlayerAction('move-right');
                    break;
                case 's':
                    handlePlayerAction('move-down');
                    break;
                case 'a':
                    handlePlayerAction('rotate-left');
                    break;
                case 'e':
                    handlePlayerAction('rotate-right');
                    break;
                default:
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);
};

export const SocketInstance = () => {
    const [socketId, setSocketId] = useState(null);

    useEffect(() => {
        setSocketId(socket.id);

        const updateSocketId = () => {
            setSocketId(socket.id);
        };

        socket.on('connect', updateSocketId);

        return () => {
            socket.off('connect', updateSocketId);
        };
    }, []);

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, padding: '5px', background: 'rgba(0, 0, 0, 0.5)', color: '#fff' }}>
            Socket ID: {socketId}
        </div>
    );
};

export const LobbyManager = () => {
    const [lobbyId, setLobbyId] = useState('');
    const [playerList, setPlayerList] = useState([]);
    const [isHost, setIsHost] = useState(false);
    const [isGameStart, setIsGameStart] = useState(false);

    useEffect(() => {
        socket.on('serverError', (error) => {
            console.error(`Error : ${error}`);
        });
        socket.on('lobbyUpdate', (lobby) => {
            setPlayerList(lobby.players);
            console.log(`Lobby updated list of players: ${lobby.players}`);
        });
        socket.on('lobbyJoined', (lobbyId) => {
            setLobbyId(lobbyId);
            console.log(`Lobby joined with ID: ${lobbyId}`);
        });
        socket.on('lobbyLeft', (lobbyId) => {
            if (isHost) {
                console.log(`Lobby deleted with ID: ${lobbyId}`);
                setIsHost(false);
            } else {
                console.log(`Lobby left with ID: ${lobbyId}`);
            }
            setLobbyId('');
            setPlayerList([]);
        });
        socket.on('lobbyCreated', (lobby) => {
            setLobbyId(lobby.id);
            setIsHost(true);
            setPlayerList(lobby.players);
            console.log(`Lobby created with ID: ${lobby.id}`);
        });
        socket.on('lobbyGameEnd', () => {
            setIsGameStart(false);
        });
        socket.on('lobbyGameStart', () => {
            setIsGameStart(true);
        });
        return () => {
            socket.off('serverError');
            socket.off('lobbyUpdate');
            socket.off('lobbyJoined');
            socket.off('lobbyLeft');
            socket.off('lobbyCreated');
            socket.off('lobbyGameEnd');
            socket.off('lobbyGameStart');
        };
    }, []);

    const createLobby = () => {
        socket.emit('createLobby');
    };
    const joinLobby = () => {
        const input = prompt('Enter lobby ID:');
        if (input) {
            socket.emit('joinLobby', input);
        }
    };
    const leaveLobby = () => {
        socket.emit('leaveLobby', lobbyId);
        setLobbyId('');
    };
    const startGame = () => {
        socket.emit('startGame', lobbyId);
    };
    const kickPlayer = (playerId) => {
        socket.emit('kickPlayer', lobbyId, playerId);
    };
    return (
        <div>
            <h1>Tetris Lobby</h1>
            <Tetris socket={socket} />
            {!isGameStart ? (
                lobbyId ? (
                    <div>
                        <button onClick={leaveLobby}>Leave Lobby</button>
                        {isHost && <button onClick={startGame}>Start Game</button>}
                        <div>
                            <h2>Player List:</h2>
                            <ul>
                                {playerList && playerList.map((playerId) => (
                                    <li key={playerId}>
                                        {playerId}
                                        {isHost && <button onClick={() => kickPlayer(playerId)}>Kick</button>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div>
                        <button onClick={createLobby}>Create Lobby</button>
                        <button onClick={joinLobby}>Join Lobby</button>
                    </div>
                )
            ) : null}
        </div>
    );
};