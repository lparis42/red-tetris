// actions/actionsPlayer.js

import {
    FETCH_PLAYERS_REQUEST,
    FETCH_PLAYERS_SUCCESS,
    FETCH_PLAYERS_FAILURE
} from './actionTypes';

export const fetchPlayers = (socket) => {
    return (dispatch) => {
        dispatch(fetchPlayersRequest('Request players list...'));

        // Demander au serveur d'envoyer la liste des joueurs
        socket.emit("getPlayers");

        // Définir un timeout pour gérer les erreurs de temps d'attente
        const timeout = setTimeout(() => {
            dispatch(fetchPlayersFailure("Timeout: Server did not respond in time"));
        }, 5000); // Temps d'attente de 5 secondes

        clearTimeout(timeout); // Effacer le timeout car nous avons reçu des données
    };
};

export const fetchPlayersRequest = () => {
    return {
        type: FETCH_PLAYERS_REQUEST
    };
};

export const fetchPlayersSuccess = (players) => {
    return {
        type: FETCH_PLAYERS_SUCCESS,
        payload: players
    };
};

export const fetchPlayersFailure = (error) => {
    return {
        type: FETCH_PLAYERS_FAILURE,
        payload: error
    };
};
