import { fireEvent, screen } from '@testing-library/react';
import { RenderWithProviders } from '../../../core/__tests__/utilities/RenderWithProviders';
import Game from './Game';

// Test ------------------------------------------------------------------------
describe("Tetris::Components::Game", () =>
{
	it("Should render a game", () =>
	{
		RenderWithProviders(<Game />,
		{
			preloadedState:
			{
				tetris:
				{
					player:
					{
						name: 'JohnDoe'
					},
					game:
					{
						isActive: true,
						players:
						[
							{
								name: `JohnDoe`,
								level: 21,
								score: 42,
								piece:
								{
									current:
									{
										position: { x: 1, y: 2 },
										content: [
											[ 3, 3, 0 ],
											[ 0, 3, 3 ],
										],
									},
									next: [
										[ 1, 1, 0 ],
										[ 0, 1, 1 ],
									],
									hold: [
										[ 0 ],
									],
								},
								grid: [
									[ 0, 0, 0, 0, 0 ],
									[ 0, 0, 0, 0, 0 ],
									[ 0, 0, 0, 0, 0 ],
									[ 0, 0, 0, 0, 2 ],
									[ 0, 3, 3, 2, 2 ],
									[ 0, 3, 3, 2, 0 ],
								]
							},
							{
								name: `Tarzan`,
								level: 21,
								score: 42,
								piece:
								{
									current:
									{
										position: { x: 1, y: 2 },
										content: [
											[ 3, 3, 0 ],
											[ 0, 3, 3 ],
										],
									},
									next: [
										[ 1, 1, 0 ],
										[ 0, 1, 1 ],
									],
									hold: [
										[ 0 ],
									],
								},
								grid: [
									[ 0, 0, 0, 0, 0 ],
									[ 0, 0, 0, 0, 0 ],
									[ 0, 0, 0, 0, 0 ],
									[ 0, 0, 0, 0, 2 ],
									[ 0, 3, 3, 2, 2 ],
									[ 0, 3, 3, 2, 0 ],
								]
							},
							{
								name: `Jane`,
								level: 21,
								score: 42,
								piece:
								{
									current:
									{
										position: { x: 1, y: 2 },
										content: [
											[ 3, 3, 0 ],
											[ 0, 3, 3 ],
										],
									},
									next: [
										[ 1, 1, 0 ],
										[ 0, 1, 1 ],
									],
									hold: [
										[ 0 ],
									],
								},
								grid: [
									[ 0, 0, 0, 0, 0 ],
									[ 0, 0, 0, 0, 0 ],
									[ 0, 0, 0, 0, 0 ],
									[ 0, 0, 0, 0, 2 ],
									[ 0, 3, 3, 2, 2 ],
									[ 0, 3, 3, 2, 0 ],
								]
							},
						],
					},
				}
			}
		});

		fireEvent.keyDown(document, { key: 's' });
		fireEvent.keyDown(document, { key: '7' });
	});

	it("Should display personal score on game end", () =>
	{
		const { store } = RenderWithProviders(<Game />,
		{
			preloadedState:
			{
				tetris:
				{
					player:
					{
						name: 'JohnDoe'
					},
					game:
					{
						isActive: true,
						players:
						[
							{
								name: `JohnDoe`,
								level: 21,
								score: 42,
								isAlive: false,
								piece:
								{
									current:
									{
										position: { x: 1, y: 2 },
										content: [
											[ 3, 3, 0 ],
											[ 0, 3, 3 ],
										],
									},
									next: [
										[ 1, 1, 0 ],
										[ 0, 1, 1 ],
									],
									hold: [
										[ 0 ],
									],
								},
								grid: [
									[ 0, 0, 0, 0, 0 ],
									[ 0, 0, 0, 0, 0 ],
									[ 0, 0, 0, 0, 0 ],
									[ 0, 0, 0, 0, 2 ],
									[ 0, 3, 3, 2, 2 ],
									[ 0, 3, 3, 2, 0 ],
								]
							},
						],
					},
				}
			}
		});

		const btn = screen.getByRole('button', { name: 'Back to Lobby' });

		fireEvent.click(btn);
		expect(store.getState().tetris.game.isActive).toBe(false);
	});

	it("Should display winner on game end", () =>
	{
		const { store } = RenderWithProviders(<Game />,
		{
			preloadedState:
			{
				tetris:
				{
					player:
					{
						name: 'JohnDoe'
					},
					game:
					{
						isActive: true,
						leader:
						{
							name: 'JohnDoe',
						},
						winner:
						{
							name: 'JaneDoe',
							score: 5234,
						},
						players:
						[
							{
								name: `JohnDoe`,
								level: 21,
								score: 42,
								isAlive: false,
								piece:
								{
									current:
									{
										position: { x: 1, y: 2 },
										content: [
											[ 3, 3, 0 ],
											[ 0, 3, 3 ],
										],
									},
									next: [
										[ 1, 1, 0 ],
										[ 0, 1, 1 ],
									],
									hold: [
										[ 0 ],
									],
								},
								grid: [
									[ 0, 0, 0, 0, 0 ],
									[ 0, 0, 0, 0, 0 ],
									[ 0, 0, 0, 0, 0 ],
									[ 0, 0, 0, 0, 2 ],
									[ 0, 3, 3, 2, 2 ],
									[ 0, 3, 3, 2, 0 ],
								]
							},
							{
								name: `JaneDoe`,
								level: 21,
								score: 42,
								isAlive: false,
								piece:
								{
									current:
									{
										position: { x: 1, y: 2 },
										content: [
											[ 3, 3, 0 ],
											[ 0, 3, 3 ],
										],
									},
									next: [
										[ 1, 1, 0 ],
										[ 0, 1, 1 ],
									],
									hold: [
										[ 0 ],
									],
								},
								grid: [
									[ 0, 0, 0, 0, 0 ],
									[ 0, 0, 0, 0, 0 ],
									[ 0, 0, 0, 0, 0 ],
									[ 0, 0, 0, 0, 2 ],
									[ 0, 3, 3, 2, 2 ],
									[ 0, 3, 3, 2, 0 ],
								]
							},
						],
					},
				}
			}
		});

		const btn = screen.getByRole('button', { name: 'Back to Lobby' });

		fireEvent.click(btn);
		expect(store.getState().tetris.game.isActive).toBe(false);
	});
});
