import { configureStore } from '@reduxjs/toolkit';
import { SocketReducers } from '../features/socket/store.slice';
import { SocketMiddleware } from '../features/socket/store.middleware';
import { TetrisReducers } from '../features/tetris/store.slice';
import { TetrisMiddleware } from '../features/tetris/store.middleware';

// Store -----------------------------------------------------------------------
export const store = configureStore(
{
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
