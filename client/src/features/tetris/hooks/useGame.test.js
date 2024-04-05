import { useState, useEffect } from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { RenderWithProviders } from '../../../core/__tests__/utilities/RenderWithProviders';
import { useGame } from './useGame';

// Mock ------------------------------------------------------------------------
const MockGame = () =>
{
	const [ value, setValue ] = useState('');
	const [ error, setError ] = useState('');
	const { suggestions, validateIdFormat, clear } = useGame();

	useEffect(() =>
	{
		const err = validateIdFormat(value);

		if ( err )
		{
			setError(err);
		}
	}, [ value ]);

	return (
		<>
			<span data-testid='error'>{ error }</span>
			<input type="text" aria-label='name' value={ value } onChange={ (e) => setValue(e.target.value) } />
			<button onClick={ clear }>clear</button>
			<ul>
				{ suggestions.map(suggestion => <li key={ suggestion.value } data-id={ suggestion.value }>{ suggestion.label }</li>) }
			</ul>
		</>
	);
};

// Test ------------------------------------------------------------------------
describe("Tetris::Hooks::useGame", () =>
{
	it("Should fail to validate game id", () =>
	{
		RenderWithProviders(<MockGame />);

		const error = screen.getByTestId('error');
		const input = screen.getByRole('textbox', { name: 'name' });

		expect(error.textContent).toBe('');
		fireEvent.change(input, { target: { value: 'WrongId@' } });
		expect(error.textContent).not.toBe('');
	});

	it("Should check if user is game leader", () =>
	{
		const { store } = RenderWithProviders(<MockGame />,
		{
			preloadedState: {
				tetris: {
					game: {
						leader: {
							name: 'JohnDoe',
						},
					},
				},
			},
		});

		expect(store.getState().tetris.game.leader.name).toBe('JohnDoe');
	});

	it("Should render suggestions list", () =>
	{
		RenderWithProviders(<MockGame />,
		{
			preloadedState: {
				tetris: {
					rooms: [
						{ id: 'Game-1', mode: 'easy' },
						{ id: 'Game-2', mode: 'standard' },
						{ id: 'Game-3', mode: 'standard' },
						{ id: 'Game-4', mode: 'expert' },
					],
				},
			},
		});

		const items = screen.getAllByRole('listitem');

		expect(items.length).toBe(4);
	});
});
