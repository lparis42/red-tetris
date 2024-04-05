
// SetImmediate
global.setImmediate = jest.useRealTimers;

// Socket.io
jest.mock('socket.io-client', () =>
{
	const eventsListeners = {};

	const socket =
	{
		connect: () =>
		{
			(eventsListeners['connect'] ?? []).forEach((cb) => cb());
			return socket;
		},
		disconnect: () =>
		{
			(eventsListeners['disconnect'] ?? []).forEach((cb) => cb())
			return socket;
		},
		emit: (event, data, callback) =>
		{
			if ( typeof callback === 'function' )
			{
				callback(data);
			}
			return socket;
		},
		on: (event, cb) =>
		{
			eventsListeners[event] = [ ...(eventsListeners[event] ?? []), cb ];
			return socket;
		},
		off: (event) =>
		{
			delete eventsListeners[event];
			return socket;
		},
		getListeners: (event) =>
		{
			if ( ! event )
			{
				return eventsListeners;
			}

			return eventsListeners[event] ?? [];
		},
		mockServerEmit: (event, payload) =>
		{
			eventsListeners[event]?.forEach(cb => cb(payload));
			return socket;
		}
	};

	return {
		__esModule: true,
		default: jest.fn(() => socket),
	};
});
