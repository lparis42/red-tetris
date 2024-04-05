import { screen, fireEvent } from '@testing-library/react';
import { RenderWithProviders } from '../../../core/__tests__/utilities/RenderWithProviders';
import { useSocket } from './useSocket';

// Mock ------------------------------------------------------------------------
const MockSocket = () =>
{
	const { connect, disconnect } = useSocket();

	const onConnect = () => connect();
	const onDisconnect = () => disconnect();

	return (
		<>
			<button onClick={ onConnect }>connect</button>
			<button onClick={ onDisconnect }>disconnect</button>
		</>
	);
};

// Test ------------------------------------------------------------------------
describe("Socket::Hooks::useSocket", () =>
{
	it("Should be disconnected by default", () =>
	{
		const { store } = RenderWithProviders(<MockSocket />);

		expect(store.getState().socket.isConnected).toBe(false);
	});

	it("Should connect the socket", () =>
	{
		const { store } = RenderWithProviders(<MockSocket />);

		const btn = screen.getByRole('button', { name: 'connect' });

		fireEvent.click(btn);
		expect(store.getState().socket.isConnected).toBe(true);
	});

	it("Should not connect the socket again", () =>
	{
		const { store } = RenderWithProviders(<MockSocket />,
		{
			preloadedState:
			{
				socket:
				{
					isConnecting: true,
					isConnected: false,
				},
			},
		});

		const btn = screen.getByRole('button', { name: 'connect' });

		expect(store.getState().socket.isConnecting).toBe(true);
		fireEvent.click(btn);
		expect(store.getState().socket.isConnected).toBe(false);
	});

	it("Should disconnect the socket", () =>
	{
		const { store } = RenderWithProviders(<MockSocket />);

		const connectBtn = screen.getByRole('button', { name: 'connect' });
		const disconnectBtn = screen.getByRole('button', { name: 'disconnect' });

		fireEvent.click(connectBtn);
		expect(store.getState().socket.isConnected).toBe(true);

		fireEvent.click(disconnectBtn);
		expect(store.getState().socket.isConnected).toBe(false);
	});
});
