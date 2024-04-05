import { render, screen } from '@testing-library/react';
import Divider from './Divider';

// Test ------------------------------------------------------------------------
describe("Core::Components::UI::Divider", () =>
{
	it("Should render a divider", () =>
	{
		render(<Divider data-testid='divider' />);

		const divider = screen.getByTestId('divider');

		expect(divider.classList.contains('divider')).toBe(true);
	});
});
