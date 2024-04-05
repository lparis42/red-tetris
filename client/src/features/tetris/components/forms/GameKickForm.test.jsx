import { screen, fireEvent } from '@testing-library/react';
import { RenderWithProviders } from '../../../../core/__tests__/utilities/RenderWithProviders';
import GameKickForm from './GameKickForm';

// Test ------------------------------------------------------------------------
describe("Tetris::Components::Form::GameKickForm", () =>
{
	it("Should submit a kick request on click", () =>
	{
		RenderWithProviders(<GameKickForm player={ { name: 'JohnDoe' } } />);

		const btn = screen.getByRole('button', { label: 'Kick' });

		fireEvent.click(btn);
	});
});
