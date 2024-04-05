import { render, screen } from '@testing-library/react';
import Select from './Select';

// Test ------------------------------------------------------------------------
describe("Core::Components::UI::Form::Select", () =>
{
	it("Should render a select with 2 options", () =>
	{
		render(<Select data-testid='select' options={ [ { label: 'A', value: 'a' }, { label: 'B' } ] } />);

		const select = screen.getByTestId('select');

		expect(select.tagName.toLowerCase()).toBe('select');
		expect(select.querySelectorAll('option').length).toBe(2);
	});
});
