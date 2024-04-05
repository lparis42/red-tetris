import { setupStore } from '../../core/store';
import { TetrisActions } from './store.slice';
import { SocketService } from '../../core/services/SocketService';
import { SocketActions } from '../socket/store.slice';

describe("Tetris::StoreMiddleware", () =>
{
	const store = setupStore();

	beforeAll(() =>
	{
		store.dispatch(SocketActions.connect());
	});

	afterAll(() =>
	{
		store.dispatch(SocketActions.disconnect());
	});

	it("Should rename player", () =>
	{
		store.dispatch(TetrisActions.PlayerRename({ name: 'SarahConnor' }));

		expect(store.getState().tetris.player.name).toBe('SarahConnor');
	});

	it("Should fail to rename player", () =>
	{
		store.dispatch(TetrisActions.PlayerRename({ error: 'Invalid Name' }));

		expect(store.getState().tetris.errors.rename).toBe('Invalid Name');
	});

	it("Should enable tetris events", () =>
	{
		store.dispatch(TetrisActions.Enable());

		expect(SocketService.getListeners('tetris:room:joined').length).toBe(1);
		expect(SocketService.getListeners('tetris:room:updated').length).toBe(1);
		expect(SocketService.getListeners('tetris:room:leave').length).toBe(1);
		expect(SocketService.getListeners('tetris:game:started').length).toBe(1);
		expect(SocketService.getListeners('tetris:game:updated').length).toBe(1);
		expect(SocketService.getListeners('tetris:game:ended').length).toBe(1);
		expect(SocketService.getListeners('tetris:game:winner').length).toBe(1);
	});

	it("Should list rooms", () =>
	{
		const ROOMS = [
			{ id: 'Room-1', mode: 'Standard' },
			{ id: 'Room-2', mode: 'Expert' },
		];

		store.dispatch(TetrisActions.GameList({ id: 'Room-', rooms: ROOMS }));

		expect(store.getState().tetris.rooms).toEqual(ROOMS);
	});

	it("Should fail to list rooms", () =>
	{
		store.dispatch(TetrisActions.GameList({ id: 'Unknown', rooms: [] }));

		expect(store.getState().tetris.rooms).toEqual([]);
		expect(store.getState().tetris.errors.join).not.toBe(null);
	});

	it("Should create a game", () =>
	{
		store.dispatch(TetrisActions.GameCreate({ id: 'GameID', mode: 'Standard' }));
	});

	it("Should fail to create a game", () =>
	{
		store.dispatch(TetrisActions.GameCreate({ id: 'GameID', mode: 'Unknown', error: { mode: 'Invalid Mode' } }));

		expect(store.getState().tetris.errors.create.mode).toBe('Invalid Mode');
	});

	it("Should emit join a game", () =>
	{
		store.dispatch(TetrisActions.GameJoin({ id: 'GameID' }));
	});

	it("Should fail to join a game", () =>
	{
		store.dispatch(TetrisActions.GameJoin({ id: 'GameID', error: 'Room does not exist' }));

		expect(store.getState().tetris.errors.join).toBe('Room does not exist');
	});

	it("Should emit a game start", () =>
	{
		store.dispatch(TetrisActions.GameStart());
	});

	it("Should emit a kick player", () =>
	{
		store.dispatch(TetrisActions.GameKick({ name: 'JohnDoe' }));
	});

	it("Should emit a game action", () =>
	{
		store.dispatch(TetrisActions.GameAction({ action: 'move-down' }));
	});

	it("Should join the game", () =>
	{
		SocketService.mockServerEmit('tetris:room:joined', {
			id: 'GameID',
			mode: 'Standard',
			active: false,
			leader: 'JohnDoe',
		});

		expect(store.getState().tetris.game.id).toBe('GameID');
		expect(store.getState().tetris.game.mode).toBe('Standard');
		expect(store.getState().tetris.game.isActive).toBe(false);
		expect(store.getState().tetris.game.leader.name).toBe('JohnDoe');
	});

	it("Should update the game players", () =>
	{
		SocketService.mockServerEmit('tetris:room:updated', {
			leader: 'Jane',
		});

		expect(store.getState().tetris.game.leader.name).toBe('Jane');

		SocketService.mockServerEmit('tetris:room:updated', {
			players: [ 'JohnDoe', 'Jane' ]
		});

		expect(store.getState().tetris.game.players.length).toBe(2);
	});

	it("Should start the game", () =>
	{
		SocketService.mockServerEmit('tetris:game:started');

		expect(store.getState().tetris.game.isActive).toBe(true);
	});

	it("Should update the game", () =>
	{
		SocketService.mockServerEmit('tetris:game:updated', {
			score: {
				name: 'JohnDoe',
				score: 999,
				level: 42,
			},
		});


		SocketService.mockServerEmit('tetris:game:updated', {
			piece: {
				name: 'JohnDoe',
				next: [[1, 1, 1, 1]],
			},
		});

		SocketService.mockServerEmit('tetris:game:updated', {
			grid: {
				name: 'JohnDoe',
				grid: [
					[0, 0, 0, 0],
					[0, 0, 1, 0],
					[0, 0, 1, 1],
					[0, 0, 1, 0],
				]
			}
		});

		const player = store.getState().tetris.game.players.find(player => player.name === 'JohnDoe');

		expect(player.score).toBe(999);
		expect(player.level).toBe(42);
		expect(player.piece.next).toEqual([[1, 1, 1, 1]]);
		expect(player.grid).toEqual([
			[0, 0, 0, 0],
			[0, 0, 1, 0],
			[0, 0, 1, 1],
			[0, 0, 1, 0],
		]);
	});

	it("Should end the game for a player", () =>
	{
		SocketService.mockServerEmit('tetris:game:ended', { name: 'Jane' });

		const player = store.getState().tetris.game.players.find(player => player.name === 'Jane');

		expect(player.isAlive).toBe(false);
	});

	it("Should set game winner", () =>
	{
		const WINNER = {
			name: 'JohnDoe',
			score: 3455
		};

		SocketService.mockServerEmit('tetris:game:winner', { scoreData: WINNER });

		expect(store.getState().tetris.game.winner).toEqual(WINNER);
	});

	it("Should leave the game", () =>
	{
		SocketService.mockServerEmit('tetris:room:leave');

		expect(store.getState().tetris.game.id).toBe(null);
	});

	it("Should disable tetris events", () =>
	{
		store.dispatch(TetrisActions.Disable());

		expect(SocketService.getListeners('tetris:room:joined').length).toBe(0);
		expect(SocketService.getListeners('tetris:room:updated').length).toBe(0);
		expect(SocketService.getListeners('tetris:room:leave').length).toBe(0);
		expect(SocketService.getListeners('tetris:game:started').length).toBe(0);
		expect(SocketService.getListeners('tetris:game:updated').length).toBe(0);
		expect(SocketService.getListeners('tetris:game:ended').length).toBe(0);
		expect(SocketService.getListeners('tetris:game:winner').length).toBe(0);
	});
});
