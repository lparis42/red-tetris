import { render, screen } from '@testing-library/react';
import Loader from './Loader';

// Test ------------------------------------------------------------------------
describe("Core::Components::UI::Loader", () =>
{
	it("Should render a loader", () =>
	{
		const TEXT = `Loading...`;

		render(<Loader data-testid='loader'>{ TEXT }</Loader>);

		const loader = screen.getByTestId('loader');

		expect(loader.textContent).toEqual(TEXT);
	});
});
