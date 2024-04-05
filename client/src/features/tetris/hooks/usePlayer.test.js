import { useState, useEffect } from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { RenderWithProviders } from '../../../core/__tests__/utilities/RenderWithProviders';
import { usePlayer } from './usePlayer';

// Mock ------------------------------------------------------------------------
const MockPlayer = () =>
{
	const [ value, setValue ] = useState('');
	const [ error, setError ] = useState('');
	const { validateNameFormat, rename, clear } = usePlayer();

	useEffect(() =>
	{
		const err = validateNameFormat(value);

		if ( err )
		{
			setError(err);
		}

		if ( err === undefined )
		{
			rename(value);
		}
	}, [ value ]);

	return (
		<>
			<span data-testid='error'>{ error }</span>
			<input type="text" aria-label='name' value={ value } onChange={ (e) => setValue(e.target.value) } />
			<button onClick={ clear }>clear</button>
		</>
	);
};

// Test ------------------------------------------------------------------------
describe("Tetris::Hooks::useSocket", () =>
{
	it("Should fail to validate name format", () =>
	{
		RenderWithProviders(<MockPlayer />);

		const error = screen.getByTestId('error');
		const input = screen.getByRole('textbox', { name: 'name' });

		expect(error.textContent).toBe('');
		fireEvent.change(input, { target: { value: 'WrongN@me' } });
		expect(error.textContent).not.toBe('');
	});

	it("Should validate name format and update store", () =>
	{
		const { store } = RenderWithProviders(<MockPlayer />);

		const error = screen.getByTestId('error');
		const input = screen.getByRole('textbox', { name: 'name' });

		expect(error.textContent).toBe('');
		expect(store.getState().tetris.player.name).toBe(null);
		fireEvent.change(input, { target: { value: 'ValidName' } });
		expect(error.textContent).toBe('');
		expect(store.getState().tetris.player.name).toBe('ValidName');
	});

	it("Should clear player error", () =>
	{
		const { store } = RenderWithProviders(<MockPlayer />,
		{
			preloadedState:
			{
				tetris:
				{
					errors:
					{
						rename: 'Invalid name',
					},
					player:
					{
						name: null,
					}
				},
			},
		});

		const btn = screen.getByRole('button', { name: 'clear' });

		expect(store.getState().tetris.errors.rename).toBe('Invalid name');
		fireEvent.click(btn);
		expect(store.getState().tetris.errors.rename).toBe(null);
	});
});
