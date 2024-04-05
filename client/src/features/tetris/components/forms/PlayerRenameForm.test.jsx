import { fireEvent, screen } from '@testing-library/react';
import { RenderWithProviders } from '../../../../core/__tests__/utilities/RenderWithProviders';
import PlayerRenameForm from './PlayerRenameForm';

// Test ------------------------------------------------------------------------
describe("Tetris::Components::Form::PlayerRenameForm", () =>
{
	it("Should set default value on init", () =>
	{
		RenderWithProviders(<PlayerRenameForm initialValue={ 'InitialPlayerName' } />);

		const input = screen.getByRole('textbox', { label: 'player_name' });

		expect(input.value).toBe('InitialPlayerName');
	});

	it("Should display an error", async () =>
	{
		RenderWithProviders(<PlayerRenameForm />);

		const input = screen.getByRole('textbox', { label: 'player_name' });

		fireEvent.change(input, { target: { value: 'WrongN@me' }});

		await screen.findByText(/Invalid Format/);
	});

	it("Should display a store error", async () =>
	{
		RenderWithProviders(<PlayerRenameForm />, {
			preloadedState: {
				tetris: {
					errors: {
						rename: 'Name is already taken',
					},
					player: {
						name: 'JohnDoe',
					},
				},
			},
		});

		await screen.findByText(/Name is already taken/);
	});

	it("Should submit on button click", () =>
	{
		RenderWithProviders(<PlayerRenameForm />);

		const btn = screen.getByRole('button');

		fireEvent.click(btn);
	});
});
