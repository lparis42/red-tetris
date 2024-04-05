import { render, screen } from '@testing-library/react';
import Modal from './Modal';

// Test ------------------------------------------------------------------------
describe("Core::Components::UI::Modal", () =>
{
	it("Should not render a modal", () =>
	{
		render(<Modal show={ false } data-testid='modal' />);

		const modal = screen.queryByTestId('modal');

		expect(modal).toBeNull();
	});

	it("Should render a modal", () =>
	{
		render(<Modal show={ true } data-testid='modal' />);

		const modal = screen.getByTestId('modal');

		expect(modal.classList.contains('z-modal')).toBe(true);
	});

	it("Should render a full modal", () =>
	{
		render(<Modal show={ true } full data-testid='modal' />);

		const modal = screen.getByTestId('modal');

		expect(modal.classList.contains('fixed')).toBe(true);
		expect(modal.classList.contains('inset-0')).toBe(true);
	});
});
