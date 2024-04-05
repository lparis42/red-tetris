import { RenderWithProviders } from '../../../core/__tests__/utilities/RenderWithProviders';
import Lobby from './Lobby';

// Test ------------------------------------------------------------------------
describe("Tetris::Components::Lobby", () =>
{
	it("Should render a lobby", () =>
	{
		RenderWithProviders(<Lobby />, {
			preloadedState: {
				tetris: {
					player: {
						name: 'JohnDoe',
					},
					game: {
						leader: {
							name: 'JohnDoe',
						},
						players:[
							{
								name: 'JohnDoe',
							},
							{
								name: 'JaneDoe',
							}
						],
					},
				},
			},
		});
	});
});
