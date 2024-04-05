import { RenderWithProviders } from '../../../core/__tests__/utilities/RenderWithProviders';
import Grid from './Grid';

// Test ------------------------------------------------------------------------
describe("Tetris::Components::Grid", () =>
{
	it("Should display a grid", () =>
	{
		const grid =
		[
			[ 0, 0, 0, 0],
			[ 2, 2, 0, 0],
			[ 2, 2, 0, 0],
			[ 0, 0, 1, 0],
			[ 0, 1, 1, 1],
		];

		RenderWithProviders(<Grid grid={ grid } />);
	});
});
