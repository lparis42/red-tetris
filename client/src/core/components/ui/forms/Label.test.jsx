import { render, screen } from '@testing-library/react';
import Label from './Label';

// Test ------------------------------------------------------------------------
describe("Core::Components::UI::Form::Label", () =>
{
	it("Should render a label", () =>
	{
		const TEXT = `Username`;

		render(<Label data-testid='label'>{ TEXT }</Label>);

		const label = screen.getByTestId('label');

		expect(label.tagName.toLowerCase()).toBe('label');
		expect(label.textContent).toBe(TEXT);
	});
});
