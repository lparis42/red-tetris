import { screen, render, fireEvent } from '@testing-library/react';
import { useInput } from './useInput';

// Mock ------------------------------------------------------------------------
const MockUseInput = ({ initValue = "", validate = undefined }) =>
{
	const { value, error, setValue, setError } = useInput(initValue, validate);

	return (
		<>
			<span data-testid='value'>{ value }</span>
			<input type='text' aria-label='value' value={ value } onChange={ (event) => setValue(event.target.value) } />

			<span data-testid='error'>{ error }</span>
			<input type='text' aria-label='error' value={ error } onChange={ (event) => setError(event.target.value) } />
		</>
	);
};

// Test ------------------------------------------------------------------------
describe("Hook: useInput", () =>
{
	it("Should initialise with a specified value", () =>
	{
		const INIT_VALUE = "Hello World!";

		render(<MockUseInput initValue={ INIT_VALUE } />);

		const value = screen.getByTestId('value');

		expect(value.textContent).toBe(INIT_VALUE);
	});

	it("Should update value on change", () =>
	{
		const INIT_VALUE = "Hello World!";
		const UPDATED_VALUE = "Bye World!";

		render(<MockUseInput initValue={ INIT_VALUE } />);

		const input = screen.getByRole('textbox', { name: 'value' });
		const value = screen.getByTestId('value');

		expect(value.textContent).toBe(INIT_VALUE);

		fireEvent.change(input, { target: { value: UPDATED_VALUE } });

		expect(value.textContent).toBe(UPDATED_VALUE);
	});

	it("Should initialise with an error", () =>
	{
		const ERROR_TEXT = "Invalid Value.";
		const validate = () => ERROR_TEXT;

		render(<MockUseInput initValue={ "Hello World!" } validate={ validate } />);

		const error = screen.getByTestId('error');

		expect(error.textContent).toBe(ERROR_TEXT);
	});
});
