import { render, screen } from '@testing-library/react';
import Input from './Input';

// Test ------------------------------------------------------------------------
describe("Core::Components::UI::Form::Input", () =>
{
	it("Should render a text input", () =>
	{
		render(<Input type='text' name='username' />);

		const input = screen.getByRole('textbox');

		expect(input.tagName.toLowerCase()).toBe('input');
		expect(input.getAttribute('type')).toBe('text');
	});

	it("Should render a text input with datalist", () =>
	{
		render(<Input type='text' name='username' suggestions={ [ { value: 'a', label: 'A' } ] } />);

		const datalist = screen.getByRole('listbox', { hidden: true });

		expect(datalist.tagName.toLowerCase()).toBe('datalist');
	});
});
