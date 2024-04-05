import { fireEvent, screen } from '@testing-library/react';
import { RenderWithProviders } from '../../../../core/__tests__/utilities/RenderWithProviders';
import GameLeaveForm from './GameLeaveForm';

// Test ------------------------------------------------------------------------
describe("Tetris::Components::Form::GameLeaveForm", () =>
{
	it("Should submit a request to leave game and update URL", () =>
	{
		window.location.hash = '#RandomGameId[PlayerName]';

		RenderWithProviders(<GameLeaveForm />);

		const btn = screen.getByRole('button', { label: 'Leave' });

		fireEvent.click(btn);

		expect(window.location.hash).toBe('#[PlayerName]');
	});
});
