// App.js

import React, { useEffect, useState, useMemo } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import logo from './logo.svg';
import './App.css';
import socketIOClient from 'socket.io-client';
import { fetchPlayersSuccess, fetchPlayersFailure } from '../actions/actionsPlayer'; // Importez l'action fetchPlayers
import store from '../store/store';

const ENDPOINT = "http://localhost:1337";

function App() {
    const dispatch = useDispatch();
    const players = useSelector(state => state.players);

    const [isListDisplayed, setIsListDisplayed] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const socket = socketIOClient(ENDPOINT);

        socket.on("updatePlayerList", updatedPlayers => {
            console.log('A new list of players has been received from the server');

            if (updatedPlayers && Array.isArray(updatedPlayers)) {
                dispatch(fetchPlayersSuccess(updatedPlayers));
                console.log('The local list of players has been updated', updatedPlayers);
            } else {
                dispatch(fetchPlayersFailure("Data is corrupted, the local list of players hasn't been updated"));
            }

        });

        socket.on("message", data => {
            setMessage(data);
        });

        // Nettoyage lors du démontage du composant
        return () => {
            socket.off("updatePlayerList");
            socket.off("message");
            socket.disconnect();
        };
    }, [dispatch]);


    return (
        <Provider store={store}>
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <p>
                        {message}
                    </p>
                    <button
                        onClick={() => setIsListDisplayed(!isListDisplayed)}
                        style={{ backgroundColor: 'transparent', border: 'none', textDecoration: 'none', cursor: 'pointer', color: '#61dafb', fontSize: '18px' }}
                    >
                        {isListDisplayed ? 'CLOSE LIST OF PLAYERS' : 'OPEN LIST OF PLAYERS'}
                    </button>

                    {isListDisplayed && (
                        <div>
                            <h2>Players</h2>
                            <ul>
                                {players.map((player, index) => (
                                    <li key={index} style={{ textAlign: 'left' }}>{`${index} : ${player.id}`}</li>
                                ))}
                            </ul>

                        </div>
                    )}
                </header>
            </div>
        </Provider >
    );
}

export default App;
