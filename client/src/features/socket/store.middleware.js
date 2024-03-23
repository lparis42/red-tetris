import { SocketService } from '../../core/services/SocketService';
import { SocketActions } from './store.slice';

// Middleware ------------------------------------------------------------------
export const SocketMiddleware = (store) =>
{
	let connecting = false;

	return (next) => (action) =>
	{
		if ( SocketActions.connect.match(action) )
		{
			if ( connecting || store.getState().socket.isConnected )
			{
				return ;
			}

			connecting = true;

			const socket = SocketService.connect();

			socket.on('connect', () =>
			{
				store.dispatch(SocketActions.connected());
			});

			socket.on('disconnect', () =>
			{
				store.dispatch(SocketActions.disconnected());
				connecting = false;
			});

			// Todo: Remove
			socket.onAny((event, ...args) =>
			{
				console.log(`Socket:onAny:${event}:`, ...args);
			});
		}

		if ( SocketActions.disconnect.match(action) )
		{
			const socket = SocketService;

			socket.off('connect');
			socket.off('disconnect');

			socket.disconnect();
		}

		return next(action);
	};
};
