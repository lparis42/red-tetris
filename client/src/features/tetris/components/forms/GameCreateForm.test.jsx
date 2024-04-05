import { fireEvent, screen } from '@testing-library/react';
import { RenderWithProviders } from '../../../../core/__tests__/utilities/RenderWithProviders';
import GameCreateForm from './GameCreateForm';
import { TetrisActions } from '../../store.slice';

// Test ------------------------------------------------------------------------
describe("Tetris::Components::Form::GameCreateForm", () =>
{
	it("Should display an error on invalid game id format", async () =>
	{
		RenderWithProviders(<GameCreateForm />);

		const input = screen.getByRole('textbox', { label: 'game_id' });

		fireEvent.change(input, { target: { value: 'InvalidG@meID' }});

		await screen.findByText(/Invalid Format/);
	});

	it("Should update error from store", async () =>
	{
		const { store } = RenderWithProviders(<GameCreateForm />, {
			preloadedState: {
				tetris: {
					errors: {
						create: {
							id: 'Room ID is already taken'
						},
					}
				}
			}
		});

		await screen.findByText(/Room ID is already taken/);

		expect(store.getState().tetris.errors.create.id).toBe(null);
	});

	it("Should create a game", () =>
	{
		const { store } = RenderWithProviders(<GameCreateForm initialValue={ 'abcdef' } />, {
			preloadedState: {
				socket: {
					isConnected: true,
				}
			}
		});

		store.dispatch(TetrisActions.Enable());

		const btn = screen.getByRole('button', { name: 'Create' });

		fireEvent.click(btn);
	});
});
