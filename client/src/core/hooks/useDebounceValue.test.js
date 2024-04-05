import { useState } from 'react';
import { screen, render, fireEvent, act } from '@testing-library/react';
import { useDebounceValue } from './useDebounceValue';

// Mock ------------------------------------------------------------------------
const MockUseDebounce = ({ initValue = '', delay = 250 }) =>
{
	const [ value, setValue ] = useState(initValue);
	const debouncedValue = useDebounceValue(value, delay);

	return (
		<>
			<span data-testid='debounced-value'>{ debouncedValue }</span>
			<input type='text' value={ value } onChange={ (event) => setValue(event.target.value) } />
		</>
	);
};

// Test ------------------------------------------------------------------------
describe("Hook: useDebounce", () =>
{

	beforeEach(() =>
	{
		jest.useFakeTimers();
	});

	afterEach(() =>
	{
		jest.useRealTimers();
	});

	it("Should initialise with default value", () =>
	{
		const INIT_VALUE = 'Hello World!';

		render(<MockUseDebounce initValue={ INIT_VALUE } />);

		const debouncedValue = screen.getByTestId('debounced-value');

		expect(debouncedValue.textContent).toBe(INIT_VALUE);
	});

	it("Should not update before specified delay", () =>
	{
		const DELAY = 25;

		render(<MockUseDebounce delay={ DELAY } />);

		const input = screen.getByRole('textbox');
		const debouncedValue = screen.getByTestId('debounced-value');

		fireEvent.change(input, { target: { value: "Bye" } });

		expect(debouncedValue.textContent).toBe("");
		act(() => jest.advanceTimersByTime(DELAY - 1));
		expect(debouncedValue.textContent).toBe("");
		act(() => jest.advanceTimersByTime(1));
		expect(debouncedValue.textContent).toBe("Bye");
	});

	it("Should reset delay on value change", () =>
	{
		const DELAY = 25;

		render(<MockUseDebounce delay={ DELAY } />);

		const input = screen.getByRole('textbox');
		const debouncedValue = screen.getByTestId('debounced-value');

		fireEvent.change(input, { target: { value: "Hidden" } });

		act(() => jest.advanceTimersByTime(DELAY - 1));
		expect(debouncedValue.textContent).toBe("");

		fireEvent.change(input, { target: { value: "Still unseen" } });

		act(() => jest.advanceTimersByTime(DELAY - 1));
		expect(debouncedValue.textContent).toBe("");

		fireEvent.change(input, { target: { value: "Bouh !" } });

		act(() => jest.advanceTimersByTime(DELAY - 1));
		expect(debouncedValue.textContent).toBe("");
		act(() => jest.advanceTimersByTime(1));
		expect(debouncedValue.textContent).toBe("Bouh !");
	});
});
