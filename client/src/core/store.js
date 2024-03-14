import { configureStore } from '@reduxjs/toolkit';
import TetrisReducer from '../features/tetris/store.slice';

// Store -----------------------------------------------------------------------
export const store = configureStore(
{
	reducer: {
		'tetris': TetrisReducer,
	},
	middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});
