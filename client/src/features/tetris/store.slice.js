import { createSlice } from '@reduxjs/toolkit';

// State -----------------------------------------------------------------------
const initialState =
{
	player: {
		name: null,
	},
	game: {
		id: null,
		mode: null,
		active: false,
		leader: null,
		players: [
			// {
			// 	name: `John`,
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
			updatePlayer: (state, { payload }) => {
				const { name } = payload;

				if (name) {
					state.player.name = name;
				}
			},
			updateGame: (state, { payload }) => {
				const { id, mode, active, leader } = payload;

				if (id) {
					state.game.id = id;
				}

				if (mode) {
					state.game.mode = mode;
				}

				if (active) {
					state.game.active = active;
				}

				if (leader) {
					state.game.leader = leader;
				}
			},
			updatePlayers: (state, { payload }) => {
				const { players } = payload;

				state.game.players = players.map((playerName) => {
					const existingPlayer = state.game.players.find(player => player.name === playerName);
					if (existingPlayer) {
						return { ...existingPlayer };
					} else {
						return {
							name: playerName,
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
					}
				});
			},
			
			updatePiece: (state, { payload }) => {
				const { name, current, next, hold } = payload;

				const player = state.game.players.find((player) => player.name === name);

				if (!player) {
					return console.log(`updatePiece: Player not found.`);
				}

				if (!player.piece) {
					player.piece = {
						current: {
							position: null,
							content: null,
						},
						next: null,
						hold: null,
					};
				}

				if (current) {
					const { position, content } = current;

					if (position) {
						player.piece.current.position = position;
					}

					if (position) {
						player.piece.current.content = content;
					}
				}

				if (next) {
					player.piece.next = next;
				}

				if (hold) {
					player.piece.hold = hold;
				}
			},
			updateGrid: (state, { payload }) => {
				
				const { name, grid } = payload;

				const player = state.game.players.find((player) => player.name === name);

				if (!player) {
					return console.log(`updateGrid: Player not found.`);
				}

				player.grid = grid;
			},
			leaveGame: (state) => {
				state.game = initialState.game;
			},
		},
	});

// Actions ---------------------------------------------------------------------
export const {
	updatePlayer,
	updateGame,
	updatePlayers,
	updatePiece,
	updateGrid,
	leaveGame,
} = slice.actions;

// Selectors -------------------------------------------------------------------
export const SelectTetris = (store) => store.tetris;

// Reducers --------------------------------------------------------------------
export default slice.reducer;
