import Merge from 'deepmerge';
import { configureStore } from '@reduxjs/toolkit';
import { SocketInitialState, SocketReducers } from '../features/socket/store.slice';
import { SocketMiddleware } from '../features/socket/store.middleware';
import { TetrisInitialState, TetrisReducers } from '../features/tetris/store.slice';
import { TetrisMiddleware } from '../features/tetris/store.middleware';

// State -----------------------------------------------------------------------
const state =
{
	'socket': SocketInitialState,
	'tetris': TetrisInitialState,
};

// Utils -----------------------------------------------------------------------
export const setupStore = (preloadedState = undefined) =>
{
	return configureStore(
	{
		preloadedState: (preloadedState) ? Merge(state, preloadedState) : undefined,
		reducer:
		{
			'socket': SocketReducers,
			'tetris': TetrisReducers,
		},
		middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(
		[
			SocketMiddleware,
			TetrisMiddleware,
		]),
	});
};

// Store -----------------------------------------------------------------------
export const store = setupStore();
