import { fireEvent, screen } from '@testing-library/react';
import { RenderWithProviders } from '../../../../core/__tests__/utilities/RenderWithProviders';
import GameJoinForm from './GameJoinForm';

// Test ------------------------------------------------------------------------
describe("Tetris::Components::Form::GameJoinForm", () =>
{
	it("Should set default value on init", () =>
	{
		RenderWithProviders(<GameJoinForm initialValue={ 'InitialGameID' } />);

		const input = screen.getByRole('combobox', { label: 'game_id' });

		expect(input.value).toBe('InitialGameID');
	});

	it("Should add suggestion on focus", () =>
	{
		RenderWithProviders(<GameJoinForm />);

		const input = screen.getByRole('combobox', { label: 'game_id' });

		fireEvent.focus(input);
	});

	it("Should add suggestion on change", () =>
	{
		RenderWithProviders(<GameJoinForm />);

		const input = screen.getByRole('combobox', { label: 'game_id' });

		fireEvent.change(input, { target: { value: 'GameID' } });
	});

	it("Should submit on button click", () =>
	{
		RenderWithProviders(<GameJoinForm />);

		const btn = screen.getByRole('button', { name: 'Join' });

		fireEvent.click(btn);
	});
});
