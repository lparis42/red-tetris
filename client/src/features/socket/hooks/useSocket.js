import { useDispatch, useSelector } from 'react-redux';
import { SocketActions, SocketStore } from '../store.slice';
import { useCallback } from 'react';

// Hook ------------------------------------------------------------------------
export const useSocket = () =>
{
	const dispatch = useDispatch();

	// Variable -----------------------
	const socket = useSelector(SocketStore);

	// Callback -----------------------
	const connect = useCallback(() =>
	{
		if ( ! socket.isConnecting )
		{
			dispatch(SocketActions.connect());
		}
	}, [ socket.isConnecting, dispatch ]);

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
