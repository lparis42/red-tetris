import { createSlice } from '@reduxjs/toolkit';

// State -----------------------------------------------------------------------
const initialState =
{
	player: {
		id: undefined,
		name: undefined,
	},
	game: {
		id: undefined,
		mode: undefined,
		active: false,
		leader: { id: undefined, name: undefined },
		boards: [
			// {
			// 	player: { id: 'Player_1', name: `John` },
			// 	piece: {
			// 		current:
			// 		{
			// 			position: { x: 3, y: 4 },
			// 			grid: [
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
	}
};

// Slice -----------------------------------------------------------------------
const slice = createSlice(
{
	name: 'tetris',
	initialState,
	reducers:
	{
		updatePlayer: (state, { payload }) =>
		{
			state.player = { ...state.player, ...payload };
		},
		updateGame: (state, { payload }) =>
		{
			state.game = { ...state.game, ...payload };
		},
		updateBoard: (state, { payload }) =>
		{
			let board = state.game.boards.find((b) => b.id === payload.id);

			if ( ! board )
			{
				board = {
					player: { id: undefined, name: undefined },
					piece: {
						current: {
							position: { x: undefined, y: undefined },
							grid: [],
						},
						next: [],
						hold: [],
					},
					grid: [],
				};

				state.game.boards.push(board);
			}

			// Todo: Modifications
		},
		leaveGame: (state) =>
		{
			state.game = initialState.game;
		},
	},
});

// Actions ---------------------------------------------------------------------
export const {
	updatePlayer,
	updateGame,
	leaveGame,
} = slice.actions;

// Selectors -------------------------------------------------------------------
export const SelectTetris = (store) => store.tetris;

// Reducers --------------------------------------------------------------------
export default slice.reducer;
