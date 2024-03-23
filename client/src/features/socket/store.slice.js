import { createSlice } from '@reduxjs/toolkit';

// State -----------------------------------------------------------------------
const initialState =
{
	isConnected: false,
};

// Slice -----------------------------------------------------------------------
const slice = createSlice(
{
	name: 'socket',
	initialState,
	reducers:
	{
		connect: () =>
		{
			return ;
		},
		connected: (state) =>
		{
			state.isConnected = true;
		},
		disconnect: () =>
		{
			return ;
		},
		disconnected: (state) =>
		{
			state.isConnected = false;
		},
	},
});

// Actions ---------------------------------------------------------------------
export const SocketActions = slice.actions;

// Selectors -------------------------------------------------------------------
export const SocketStore = (store) => store.socket;

// Reducers --------------------------------------------------------------------
export const SocketReducers = slice.reducer;
