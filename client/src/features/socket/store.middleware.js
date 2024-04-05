import { SocketService } from '../../core/services/SocketService';
import { SocketActions } from './store.slice';

// Middleware ------------------------------------------------------------------
export const SocketMiddleware = (store) =>
{
	return (next) => (action) =>
	{
		if ( SocketActions.connect.match(action) )
		{
			const socket = SocketService;

			socket.on('connect', () =>
			{
				store.dispatch(SocketActions.connected());
			});

			socket.on('disconnect', () =>
			{
				store.dispatch(SocketActions.disconnected());
			});

			socket.connect();
		}

		if ( SocketActions.disconnect.match(action) )
		{
			const socket = SocketService;

			socket.disconnect();

			socket.off('connect');
			socket.off('disconnect');
		}

		return next(action);
	};
};
