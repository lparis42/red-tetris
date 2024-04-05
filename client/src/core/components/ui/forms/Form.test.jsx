import { render, screen } from '@testing-library/react';
import Form from './Form';

// Test ------------------------------------------------------------------------
describe("Core::Components::UI::Form::Form", () =>
{
	it("Should render a form", () =>
	{
		render(<Form name='dummy' />);

		const form = screen.getByRole('form', {  });

		expect(form.tagName.toLowerCase()).toBe('form');
	});
});
