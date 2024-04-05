import { createSlice } from '@reduxjs/toolkit';

// State -----------------------------------------------------------------------
export const SocketInitialState =
{
	isConnecting: false,
	isConnected: false,
};

// Slice -----------------------------------------------------------------------
const slice = createSlice(
{
	name: 'socket',
	initialState: SocketInitialState,
	reducers:
	{
		connect: (state) =>
		{
			state.isConnecting = true;
		},
		connected: (state) =>
		{
			state.isConnecting = false;
			state.isConnected = true;
		},
		disconnect: (state) =>
		{
			state.isConnecting = false;
		},
		disconnected: (state) =>
		{
			state.isConnecting = false;
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
