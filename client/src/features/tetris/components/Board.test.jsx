import { screen } from '@testing-library/react';
import { RenderWithProviders } from '../../../core/__tests__/utilities/RenderWithProviders';
import Board from './Board';

// Test ------------------------------------------------------------------------
describe("Tetris::Components::Board", () =>
{
	it("Should display a board", () =>
	{
		const player =
		{
			name: 'JohnDoe',
			isAlive: true,
			score: 42,
			level: 21,
			piece:
			{
				current:
				{
					position: null,
					content: null,
				},
				next: null,
				hold: null,
			},
			grid: [
				[ 0, 0, 0, 0 ],
				[ 5, 0, 0, 0 ],
				[ 5, 0, 0, 0 ],
				[ 5, 0, 0, 0 ],
				[ 5, 0, 0, 0 ],
			],
		};

		RenderWithProviders(<Board player={ player } mode='Easy' />);
	});

	it("Should display a board with next/hold piece preview ", () =>
	{
		const player =
		{
			name: 'JohnDoe',
			isAlive: true,
			piece:
			{
				current:
				{
					position: null,
					content: null,
				},
				next: [
					[ 2, 2 ],
					[ 2, 2 ],
				],
				hold: [
					[ 2, 2 ],
					[ 2, 2 ],
				],
			},
			grid: [
				[ 0, 0, 0, 0 ],
				[ 5, 0, 0, 0 ],
				[ 5, 0, 0, 0 ],
				[ 5, 0, 0, 0 ],
				[ 5, 0, 0, 0 ],
			],
		};

		RenderWithProviders(<Board player={ player } mode='Easy' />);
	});

	it("Should display a board with current piece + ghost", () =>
	{
		const player =
		{
			name: 'JohnDoe',
			isAlive: true,
			score: 42,
			level: 21,
			piece:
			{
				current:
				{
					position: { x: 1, y: 1 },
					content: [
						[2, 2, 0],
						[0, 2, 2],
					],
				},
				next: null,
				hold: null,
			},
			grid: [
				[ 0, 0, 0, 0 ],
				[ 5, 0, 0, 0 ],
				[ 5, 0, 0, 0 ],
				[ 5, 0, 0, 0 ],
				[ 5, 0, 0, 0 ],
			],
		};

		RenderWithProviders(<Board player={ player } mode='Easy' />);
	});

	it("Should display loader when grid is null", async () =>
	{
		const player =
		{
			name: 'JohnDoe',
			isAlive: true,
			score: 42,
			level: 21,
			piece:
			{
				current:
				{
					position: null,
					content: null,
				},
				next: null,
				hold: null,
			},
			grid: null
		};

		RenderWithProviders(<Board player={ player } mode='Easy' />);

		await screen.findByText(/Loading/);
	});
});
