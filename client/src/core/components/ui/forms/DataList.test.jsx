import { render, screen } from '@testing-library/react';
import DataList from './DataList';

// Test ------------------------------------------------------------------------
describe("Core::Components::UI::Form::DataList", () =>
{
	it("Should render a datalist", () =>
	{
		render(<DataList options={ [ { value: 'a', label: 'A' } ] } />);

		const datalist = screen.getByRole('listbox', { hidden: true });

		expect(datalist.tagName.toLowerCase()).toBe('datalist');
		expect(datalist.querySelectorAll('option').length).toBe(1);
	});
});
