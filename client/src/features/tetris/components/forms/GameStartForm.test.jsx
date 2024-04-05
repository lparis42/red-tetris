import { fireEvent, screen } from '@testing-library/react';
import { RenderWithProviders } from '../../../../core/__tests__/utilities/RenderWithProviders';
import GameStartForm from './GameStartForm';

// Test ------------------------------------------------------------------------
describe("Tetris::Components::Form::GameStartForm", () =>
{
	it("Should render a clickable button", () =>
	{
		RenderWithProviders(<GameStartForm />, {
			preloadedState: {
				tetris: {
					player: {
						name: 'JohnDoe',
					},
					game: {
						leader: {
							name: 'JohnDoe',
						},
					},
				},
			},
		});

		const btn = screen.getByRole('button');

		expect(btn.getAttribute('disabled')).toBe(null);
	});

	it("Should render a non clickable button", () =>
	{
		RenderWithProviders(<GameStartForm />, {
			preloadedState: {
				tetris: {
					player: {
						name: 'Jane',
					},
					game: {
						leader: {
							name: 'JohnDoe',
						},
					},
				},
			},
		});

		const btn = screen.getByRole('button');

		expect(btn.getAttribute('disabled')).toBe('');
	});

	it("Should submit on button click", () =>
	{
		RenderWithProviders(<GameStartForm />, {
			preloadedState: {
				tetris: {
					player: {
						name: 'JohnDoe',
					},
					game: {
						leader: {
							name: 'JohnDoe',
						},
					},
				},
			},
		});

		const btn = screen.getByRole('button');

		fireEvent.click(btn);
	});
});
