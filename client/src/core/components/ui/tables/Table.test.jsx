import { render, screen } from '@testing-library/react';
import Table from './Table';

// Test ------------------------------------------------------------------------
describe("Core::Components::UI::Table", () =>
{
	it("Should render a table without header", () =>
	{
		render(<Table rows={ [] } />);

		const table = screen.getByRole('table');

		expect(table.querySelector('thead')).toBeNull();
	});

	it("Should render a table with header", () =>
	{
		render(<Table header={ [ { title: "Title", span: '1' } ] } rows={ [] } />);

		const table = screen.getByRole('table');

		expect(table.querySelector('thead')).not.toBeNull();
	});

	it("Should render a table with rows", () =>
	{
		render(
			<Table rows={ [
				{ key: 1, cells: [ { key: 'Row 1', content: 'Cell 1' } ] },
				{ key: 2, cells: [ { key: 'Row 2', content: 'Cell 2' } ] },
			] } />
		);

		const table = screen.getByRole('table');

		expect(table.querySelectorAll('tr').length).toEqual(2);
	});
});
