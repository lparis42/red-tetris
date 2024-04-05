import { screen } from '@testing-library/react';
import { RenderWithProviders } from '../../../core/__tests__/utilities/RenderWithProviders';
import Tetris from './Tetris';

// Test ------------------------------------------------------------------------
describe("Tetris::Components::Tetris", () =>
{
	it("Should not display loading screen", () =>
	{
		RenderWithProviders(<Tetris />);

		const loading = screen.queryByText(/Loading/);

		expect(loading).toBe(null);
	});
});
