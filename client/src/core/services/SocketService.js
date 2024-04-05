import io from 'socket.io-client';

// Service ---------------------------------------------------------------------
export const SocketService = io('http://localhost/',
	{
		autoConnect: false
	},
);
