import { createSlice } from '@reduxjs/toolkit';

// State -----------------------------------------------------------------------
const initialState =
{
	errors: {
		rename: null,
		create: {
			id: null,
			mode: null,
		},
		join: null,
	},
	rooms: null,
	player: {
		name: null,
	},
	game: {
		id: null,
		mode: null,
		isActive: false,
		leader: {
			name: null,
		},
		winner: {
			name: null,
			score: null,
		},
		players: [
			// {
			// 	name: `John`,
			// 	level: 13,
			//  score: 6594,
			// 	piece: {
			// 		current:
			// 		{
			// 			position: { x: 3, y: 4 },
			// 			content: [
			// 				[ 3, 3, 0 ],
			// 				[ 0, 3, 3 ],
			// 			],
			// 		},
			// 		next: [
			// 			[ 1, 1, 0 ],
			// 			[ 0, 1, 1 ],
			// 		],
			// 		hold: [
			// 			[ 0 ],
			// 		],
			// 	},
			// 	grid: [
			// 		[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
			// 		[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
			// 		[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
			// 		[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
			// 		[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
			// 		[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
			// 		[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
			// 		[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
			// 		[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
			// 		[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
			// 		[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
			// 		[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
			// 		[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
			// 		[ 0, 0, 0, 0, 0, 5, 5, 0, 0, 0 ],
			// 		[ 0, 0, 2, 2, 0, 5, 5, 0, 0, 0 ],
			// 		[ 0, 0, 2, 3, 4, 4, 0, 0, 0, 6 ],
			// 		[ 0, 0, 2, 3, 3, 4, 4, 7, 7, 6 ],
			// 		[ 1, 1, 1, 3, 0, 0, 7, 7, 6, 6 ],
			// 		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
			// 		[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
			// 	]
			// },
		],
	},
};

// Slice -----------------------------------------------------------------------
const slice = createSlice(
{
	name: 'tetris',
	initialState,
	reducers:
	{
		Enable: () =>
		{
			return ; // Note: Used by middleware
		},
		Disable: () =>
		{
			return ; // Note: Used by middleware
		},
		ErrorsClear: (state) =>
		{
			state.errors = initialState.errors;
		},
		PlayerRename: (state, { payload }) =>
		{
			const { name } = payload;

			state.player.name = name;
		},
		PlayerRenameFailed: (state, { payload }) =>
		{
			const { error } = payload;

			state.errors.rename = error;
		},
		GameList: (state, { payload }) =>
		{
			const { rooms } = payload;

			state.rooms = rooms;
		},
		GameCreate: () =>
		{
			return ; // Note: Used to trigger middleware
		},
		GameCreateFailed: (state, { payload }) =>
		{
			const { error } = payload;

			state.errors.create.id = error.id;
			state.errors.create.mode = error.mode;
		},
		GameJoin: () =>
		{
			return ; // Note: Used to trigger middleware
		},
		GameJoinFailed: (state, { payload }) =>
		{
			const { error } = payload;

			state.errors.join = error;
		},
		GameUpdateInfos: (state, { payload }) =>
		{
			const { id, mode, active, leader } = payload;

			if ( id )
			{
				state.game.id = id;
			}

			if ( mode )
			{
				state.game.mode = mode;
			}

			if ( active )
			{
				state.game.isActive = active;
			}

			if ( leader )
			{
				state.game.leader.name = leader.name;
			}
		},
		GameUpdatePlayers: (state, { payload }) =>
		{
			const { players } = payload;

			state.game.players = players.map((name) =>
			{
				const player = state.game.players.find(player => player.name === name);

				if ( player )
				{
					return player;
				}

				return {
					name: name,
					isAlive: null,
					piece: {
						current: {
							position: null,
							content: null,
						},
						next: null,
						hold: null,
					},
					grid: null
				};
			});
		},
		GameLeave: (state) =>
		{
			state.game = initialState.game;
		},
		GameStart: () =>
		{
			return ; // Note: Used to trigger middleware
		},
		GameStarted: (state) =>
		{
			state.game.players.forEach(player => player.isAlive = true);
			state.game.winner.name = initialState.game.winner.name;
			state.game.isActive = true;
		},
		GameEnd: (state) =>
		{
			state.game.isActive = false;
		},
		GameEnded: (state, { payload }) =>
		{
			const { name } = payload;
			const player = state.game.players.find((player) => player.name === name);

			if ( ! player )
			{
				return ;
			}

			player.isAlive = false;
		},
		GameWinner: (state, { payload }) =>
		{
			const { winner } = payload;

			state.game.winner.name = winner.name;
			state.game.winner.score = winner.score;

			// state.game.isActive = false;
		},
		GameKick: () =>
		{
			return ; // Note: Used to trigger middleware
		},
		GameAction: () =>
		{
			return ; // Note: Used to trigger middleware
		},
		GameUpdateScore: (state, { payload }) =>
		{
			const { name, score, level } = payload;
			const player = state.game.players.find((player) => player.name === name);

			if ( ! player )
			{
				return ;
			}

			player.score = score;
			player.level = level;
		},
		GameUpdatePiece: (state, { payload }) =>
		{
			const { name, current, next, hold } = payload;
			const player = state.game.players.find((player) => player.name === name);

			if ( ! player )
			{
				return ;
			}

			if ( ! player.piece )
			{
				player.piece = {
					current: {
						position: null,
						content: null,
					},
					next: null,
					hold: null,
				};
			}

			if ( current )
			{
				const { position, content } = current;

				if ( position )
				{
					player.piece.current.position = position;
				}

				if ( content )
				{
					player.piece.current.content = content;
				}
			}

			if ( next )
			{
				player.piece.next = next;
			}

			if ( hold )
			{
				player.piece.hold = hold;
			}
		},
		GameUpdateGrid: (state, { payload }) =>
		{
			const { name, grid } = payload;

			const player = state.game.players.find((player) => player.name === name);

			if ( ! player )
			{
				return ;
			}

			player.grid = grid;
		},
	},
});

// Actions ---------------------------------------------------------------------
export const TetrisActions = slice.actions;

// Selectors -------------------------------------------------------------------
export const TetrisStore = (store) => store.tetris;

// Reducers --------------------------------------------------------------------
export const TetrisReducers = slice.reducer;
