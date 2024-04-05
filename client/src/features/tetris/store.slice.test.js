import { setupStore } from '../../core/store';
import { TetrisActions } from './store.slice';

describe("Tetris::StoreSlice", () =>
{
	it("Should clear errors", () =>
	{
		const ERRORS =
		{
			rename: `Invalid Player Name`,
			create: {
				id: `Invalid Game ID`,
			},
		};

		const store = setupStore(
		{
			tetris:
			{
				errors: ERRORS
			},
		});

		expect(store.getState().tetris.errors.rename).toBe(ERRORS.rename);
		expect(store.getState().tetris.errors.create.id).toBe(ERRORS.create.id);

		store.dispatch(TetrisActions.ErrorsClear());

		expect(store.getState().tetris.errors.rename).toBe(null);
		expect(store.getState().tetris.errors.create.id).toBe(null);
	});

	it("Should rename player", () =>
	{
		const PLAYER =
		{
			name: 'JohnDoe',
		};

		const store = setupStore();

		expect(store.getState().tetris.player.name).toBe(null);
		store.dispatch(TetrisActions.PlayerRename(PLAYER));
		expect(store.getState().tetris.player.name).toBe(PLAYER.name);
	});

	it("Should update rename error", () =>
	{
		const ERROR = `Invalid Player Name`;
		const store = setupStore();

		expect(store.getState().tetris.errors.rename).toBe(null);
		store.dispatch(TetrisActions.PlayerRenameFailed({ error: ERROR }));
		expect(store.getState().tetris.errors.rename).toBe(ERROR);
	});

	it("Should update game list", () =>
	{
		const ROOMS =
		[
			{ id: 'abcdef', mode: 'Easy' },
			{ id: 'fedcba', mode: 'Standard' },
		];

		const store = setupStore();

		expect(store.getState().tetris.rooms).toBe(null);
		store.dispatch(TetrisActions.GameList({ rooms: ROOMS }));
		expect(store.getState().tetris.rooms).toBe(ROOMS);
	});

	it("Should update create error", () =>
	{
		const ERROR =
		{
			id: `Invalid Game ID`,
			mode: `Invalid Game Mode`
		};

		const store = setupStore();

		expect(store.getState().tetris.errors.create.id).toBe(null);
		expect(store.getState().tetris.errors.create.mode).toBe(null);

		store.dispatch(TetrisActions.GameCreateFailed({ error: ERROR }));

		expect(store.getState().tetris.errors.create.id).toBe(ERROR.id);
		expect(store.getState().tetris.errors.create.mode).toBe(ERROR.mode);
	});

	it("Should update join error", () =>
	{
		const ERROR = `Game is Full`;

		const store = setupStore();

		expect(store.getState().tetris.errors.join).toBe(null);
		store.dispatch(TetrisActions.GameJoinFailed({ error: ERROR }));
		expect(store.getState().tetris.errors.join).toBe(ERROR);
	});

	it("Should update game infos", () =>
	{
		const INFOS =
		{
			id: '123',
			mode: 'Expert',
			active: true,
		};

		const store = setupStore();

		expect(store.getState().tetris.game.id).toBe(null);
		expect(store.getState().tetris.game.mode).toBe(null);
		expect(store.getState().tetris.game.isActive).toBe(false);
		expect(store.getState().tetris.game.leader.name).toBe(null);

		store.dispatch(TetrisActions.GameUpdateInfos(INFOS));

		expect(store.getState().tetris.game.id).toBe(INFOS.id);
		expect(store.getState().tetris.game.mode).toBe(INFOS.mode);
		expect(store.getState().tetris.game.isActive).toBe(INFOS.active);
	});

	it("Should update game players", () =>
	{
		const STATE =
		[
			{
				name: 'JohnDoe',
				isAlive: null,
				piece:
				{
					current:
					{
						content: null,
						position: null,
					},
					hold: null,
					next: null,
				},
				grid: null,
			},
		];

		const PLAYERS =
		[
			'JohnDoe',
			'JaneDoe',
		];

		const store = setupStore({
			tetris:
			{
				game: {
					players: STATE,
				},
			},
		});

		expect(store.getState().tetris.game.players).toEqual(STATE);

		store.dispatch(TetrisActions.GameUpdatePlayers({ players: PLAYERS }));

		expect(store.getState().tetris.game.players).toEqual(
		[
			{
				name: 'JohnDoe',
				isAlive: null,
				piece:
				{
					current:
					{
						content: null,
						position: null,
					},
					hold: null,
					next: null,
				},
				grid: null,
			},
			{
				name: 'JaneDoe',
				isAlive: null,
				piece:
				{
					current:
					{
						content: null,
						position: null,
					},
					hold: null,
					next: null,
				},
				grid: null,
			},
		]);
	});

	it("Should start the game", () =>
	{
		const store = setupStore();

		store.dispatch(TetrisActions.GameUpdatePlayers({
			players: [ 'JohnDoe', 'JaneDoe' ]
		}));

		store.dispatch(TetrisActions.GameStarted());

		expect(store.getState().tetris.game.winner.name).toBe(null);
		expect(store.getState().tetris.game.isActive).toBe(true);

		store.getState().tetris.game.players.forEach(player =>
			expect(player.isAlive).toBe(true)
		);
	});

	it("Should end the game", () =>
	{
		const store = setupStore();

		store.dispatch(TetrisActions.GameStarted());
		store.dispatch(TetrisActions.GameEnd());

		expect(store.getState().tetris.game.isActive).toBe(false);
	});

	it("Should end the game for a player", () =>
	{
		const store = setupStore();

		store.dispatch(TetrisActions.GameUpdatePlayers({
			players: ['JohnDoe', 'JaneDoe' ]
		}));

		store.dispatch(TetrisActions.GameStarted());
		store.dispatch(TetrisActions.GameEnded({ name: 'JohnDoe' }));
		store.dispatch(TetrisActions.GameEnded({ name: 'Unknown' }));

		expect(store.getState().tetris.game.players.find(p => p.name === 'JohnDoe').isAlive).toBe(false);
		expect(store.getState().tetris.game.players.find(p => p.name === 'JaneDoe').isAlive).toBe(true);
	});

	it("Should update game winner", () =>
	{
		const WINNER =
		{
			name: 'JohnDoe',
			score: 1234,
		};

		const store = setupStore();

		store.dispatch(TetrisActions.GameWinner({ winner: WINNER }));

		expect(store.getState().tetris.game.winner).toEqual(WINNER);
	});

	it("Should update player score", () =>
	{
		const PLAYER =
		{
			name: 'JohnDoe',
			score: 1234,
			level: 321,
		};

		const store = setupStore();

		store.dispatch(TetrisActions.GameUpdatePlayers({
			players: ['JohnDoe', 'JaneDoe' ]
		}));

		store.dispatch(TetrisActions.GameUpdateScore(PLAYER));
		store.dispatch(TetrisActions.GameUpdateScore({ name: 'unknown' }));

		const player = store.getState().tetris.game.players.find(p => p.name === PLAYER.name);

		expect(player.level).toBe(PLAYER.level);
		expect(player.score).toBe(PLAYER.score);
	});

	it("Should update player pieces", () =>
	{
		const store = setupStore();

		store.dispatch(TetrisActions.GameUpdatePlayers({
			players: ['JohnDoe', 'JaneDoe' ]
		}));

		store.dispatch(TetrisActions.GameUpdatePiece({
			name: 'JohnDoe',
			current: {
				position: { x: 2, y: 5 },
			},
		}));
		store.dispatch(TetrisActions.GameUpdatePiece({
			name: 'JohnDoe',
			current: {
				content: [ [1, 1, 1, 1] ],
			},
		}));
		store.dispatch(TetrisActions.GameUpdatePiece({
			name: 'JohnDoe',
			next: [
				[1, 1, 0]
				[0, 1, 1]
			],
		}));
		store.dispatch(TetrisActions.GameUpdatePiece({
			name: 'JohnDoe',
			hold: [
				[2, 2],
				[2, 2]
			]
		}));
		store.dispatch(TetrisActions.GameUpdatePiece({ name: 'unknown' }));

		const player = store.getState().tetris.game.players.find(p => p.name === 'JohnDoe');

		expect(player.piece.current).toEqual({
			position: { x: 2, y: 5 },
			content: [ [1, 1, 1, 1] ],
		});
		expect(player.piece.next).toEqual([
			[1, 1, 0]
			[0, 1, 1]
		]);
		expect(player.piece.hold).toEqual([
			[2, 2],
			[2, 2]
		]);
	});

	it("Should update player grid", () =>
	{
		const PLAYER =
		{
			name: 'JohnDoe',
			grid: [
				[0, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 1, 1, 0],
				[0, 1, 2, 0],
			]
		};

		const store = setupStore();

		store.dispatch(TetrisActions.GameUpdatePlayers({
			players: ['JohnDoe', 'JaneDoe' ]
		}));

		store.dispatch(TetrisActions.GameUpdateGrid(PLAYER));
		store.dispatch(TetrisActions.GameUpdateGrid({ name: 'unknown' }));

		const player = store.getState().tetris.game.players.find(p => p.name === PLAYER.name);

		expect(player.grid).toEqual(PLAYER.grid);
	});
});
