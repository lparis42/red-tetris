import { render, screen } from '@testing-library/react';
import Field from './Field';

// Test ------------------------------------------------------------------------
describe("Core::Components::UI::Form::Field", () =>
{
	it("Should render a field without error", () =>
	{
		render(
			<Field label="Username">
				<input type='text' name='username'/>
			</Field>
		);

		const input = screen.getByLabelText('Username');

		expect(input.tagName.toLowerCase()).toBe('input');
	});

	it("Should render a field with an error", () =>
	{
		render(
			<Field label="Username" error="Invalid username">
				<input type='text' name='username'/>
			</Field>
		);

		const error = screen.getByText('Invalid username');

		expect(error).not.toBeNull();
	});
});
