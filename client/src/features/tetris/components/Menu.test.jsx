import { screen } from '@testing-library/react';
import { RenderWithProviders } from '../../../core/__tests__/utilities/RenderWithProviders';
import Menu from './Menu';

// Test ------------------------------------------------------------------------
describe("Tetris::Components::Menu", () =>
{
	it("Should render player rename form", () =>
	{
		RenderWithProviders(<Menu />);

		screen.getByRole('textbox', { label: 'player_name' });
	});

	it("Should render game forms", () =>
	{
		RenderWithProviders(<Menu />, {
			preloadedState: {
				tetris: {
					player: {
						name: 'JohnDoe',
					},
				},
			},
		});

		screen.getByRole('textbox', { label: 'game_id' });
		screen.getByRole('combobox', { name: 'Game ID' });
	});

	it("Should render lobby form", () =>
	{
		RenderWithProviders(<Menu />, {
			preloadedState: {
				tetris: {
					player: {
						name: 'JohnDoe',
					},
					game: {
						id: 'GameID',
						leader: {
							name: 'JohnDoe',
						},
						players: [
							{
								name: 'JohnDoe',
							}
						]
					},
				},
			},
		});

		screen.getByRole('button', { name: 'Start' });
	});
});
