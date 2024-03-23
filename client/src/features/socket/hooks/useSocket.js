import { useDispatch, useSelector } from 'react-redux';
import { SocketActions, SocketStore } from '../store.slice';
import { useCallback } from 'react';

// Hook ------------------------------------------------------------------------
export const useSocket = () =>
{
	const dispatch = useDispatch();
	const store = useSelector(SocketStore);

	// Variable -----------------------
	const socket = store;

	// Callback -----------------------
	const connect = useCallback(() =>
	{
		dispatch(SocketActions.connect());
	}, [ dispatch ]);

	const disconnect = useCallback(() =>
	{
		dispatch(SocketActions.disconnect());
	}, [ dispatch ]);

	// Expose -------------------------
	return {
		socket,
		connect,
		disconnect,
	};
};
