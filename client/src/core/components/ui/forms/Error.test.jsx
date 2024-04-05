import { render, screen } from '@testing-library/react';
import Error from './Error';

// Test ------------------------------------------------------------------------
describe("Core::Components::UI::Form::Error", () =>
{
	it("Should render an error", () =>
	{
		const TEXT = `Invalid username.`;

		render(<Error data-testid='error'>{ TEXT }</Error>);

		const error = screen.getByTestId('error');

		expect(error.textContent).toBe(TEXT);
		expect(error.classList.contains('text-red')).toBe(true);
	});
});
