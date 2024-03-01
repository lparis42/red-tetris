// App.js

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import './App.css';
import store from '../store/store';

import { useKeyboardEvents, SocketInstance, RoomManager } from './socketManager';


function App() {
    
    // Gérer les événements clavier pour les actions du joueur
    useKeyboardEvents();
    
    return (
        <Provider store={store}>
            <div className="App">
                <header className="App-header">
                <SocketInstance />
                <RoomManager />
                </header>
            </div>
        </Provider >
    );
}

export default App;
