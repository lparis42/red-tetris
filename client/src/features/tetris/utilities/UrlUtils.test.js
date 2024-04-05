import { UrlUtils } from './UrlUtils';

// Test ------------------------------------------------------------------------
describe("Tetris::Utils::UrlUtils", () =>
{
	it("Should return Game Id and Player Name", () =>
	{
		window.location.hash = '#GameId[PlayerName]';

		const gameId = UrlUtils.get('game');
		const playerName = UrlUtils.get('player');

		expect(gameId).toBe('GameId');
		expect(playerName).toBe('PlayerName');
	});

	it("Should clear Game Id and Player Name", () =>
	{
		window.location.hash = '#GameId[PlayerName]';

		UrlUtils.set({ game: '', player: '' });

		const gameId = UrlUtils.get('game');
		const playerName = UrlUtils.get('player');

		expect(gameId).toBe('');
		expect(playerName).toBe('');

		UrlUtils.set({ game: '', player: '' });
	});

	it("Should set Game Id and Player Name", () =>
	{
		window.location.hash = '#';

		UrlUtils.set({ game: 'GameId' });

		const gameId = UrlUtils.get('game');
		expect(gameId).toBe('GameId');

		UrlUtils.set({ player: 'PlayerName' });

		const playerName = UrlUtils.get('player');
		expect(playerName).toBe('PlayerName');
	});
});
