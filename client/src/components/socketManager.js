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

export const RoomManager = () => {
    const [roomId, setRoomId] = useState('');
    const [playerList, setPlayerList] = useState([]);
    const [isHost, setIsHost] = useState(false);
    const [isGameStart, setIsGameStart] = useState(false);

    useEffect(() => {
        socket.on('serverError', (error) => {
            console.error(`Error : ${error}`);
        });
        socket.on('roomUpdate', (room) => {
            setPlayerList(room.players);
            console.log(`Room updated list of players: ${room.players}`);
        });
        socket.on('roomJoined', (roomId) => {
            setRoomId(roomId);
            console.log(`Room joined with ID: ${roomId}`);
        });
        socket.on('roomLeft', (roomId) => {
            if (isHost) {
                console.log(`Room deleted with ID: ${roomId}`);
                setIsHost(false);
            } else {
                console.log(`Room left with ID: ${roomId}`);
            }
            setRoomId('');
            setPlayerList([]);
        });
        socket.on('roomCreated', (room) => {
            setRoomId(room.id);
            setIsHost(true);
            setPlayerList(room.players);
            console.log(`Room created with ID: ${room.id}`);
        });
        socket.on('roomGameEnd', () => {
            setIsGameStart(false);
        });
        socket.on('roomGameStart', () => {
            setIsGameStart(true);
        });
        return () => {
            socket.off('serverError');
            socket.off('roomUpdate');
            socket.off('roomJoined');
            socket.off('roomLeft');
            socket.off('roomCreated');
            socket.off('roomGameEnd');
            socket.off('roomGameStart');
        };
    }, []);

    const createRoom = () => {
        socket.emit('createRoom');
    };
    const joinRoom = () => {
        const input = prompt('Enter room ID:');
        if (input) {
            socket.emit('joinRoom', input);
        }
    };
    const leaveRoom = () => {
        socket.emit('leaveRoom');
        setRoomId('');
    };
    const startGame = () => {
        socket.emit('startGame');
    };
    const kickPlayer = (playerId) => {
        socket.emit('kickPlayer', playerId);
    };
    return (
        <div>
            <h1>Tetris Room</h1>
            <Tetris socket={socket} />
            {!isGameStart ? (
                roomId ? (
                    <div>
                        <button onClick={leaveRoom}>Leave Room</button>
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
                        <button onClick={createRoom}>Create Room</button>
                        <button onClick={joinRoom}>Join Room</button>
                    </div>
                )
            ) : null}
        </div>
    );
};