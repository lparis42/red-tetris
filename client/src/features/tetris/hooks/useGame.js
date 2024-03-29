import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TetrisActions, TetrisStore } from '../store.slice';

// Constant --------------------------------------------------------------------
const GameIdRegex = /^(?:\w){6,16}$/;

// Hook ------------------------------------------------------------------------
export const useGame = () =>
{
	const dispatch = useDispatch();
	const store = useSelector(TetrisStore);

	// Variable ------------------------
	const game = store.game;
	const errors = store.errors;

	// Function ------------------------
	function isGameLeader(name)
	{
		return ( game.leader.name === name );
	}

	// Memo ----------------------------
	const suggestions = useMemo(() =>
	{
		return store.rooms?.map((room) => (
		{
			value: room.id,
			label: `[${ room.mode }] ${ room.id }`,
		})) ?? [];
	}, [ store.rooms ]);

	// Callback ------------------------
	const validateIdFormat = useCallback((id) =>
	{
		if ( ! id )
		{
			return false;
		}

		if ( ! GameIdRegex.test(id) )
		{
			return `Invalid Format: (a-z, A-Z, 0-9, _){6, 16}`;
		}
	}, []);

	const enable = useCallback(() =>
	{
		dispatch(TetrisActions.Enable());
	}, [ dispatch ]);

	const disable = useCallback(() =>
	{
		dispatch(TetrisActions.Disable());
	}, [ dispatch ]);

	const list = useCallback((id) =>
	{
		dispatch(TetrisActions.GameList({ id }));
	}, [ dispatch ]);

	const create = useCallback((id, mode) =>
	{
		dispatch(TetrisActions.GameCreate({ id, mode }));
	}, [ dispatch ]);

	const join = useCallback((id) =>
	{
		dispatch(TetrisActions.GameJoin({ id }));
	}, [ dispatch ]);

	const leave = useCallback(() =>
	{
		dispatch(TetrisActions.GameLeave());
	}, [ dispatch ]);

	const start = useCallback(() =>
	{
		dispatch(TetrisActions.GameStart());
	}, [ dispatch ]);

	const end = useCallback(() =>
	{
		dispatch(TetrisActions.GameEnd());
	}, [ dispatch ]);

	const kick = useCallback((name) =>
	{
		dispatch(TetrisActions.GameKick({ name }));
	}, [ dispatch ]);

	const action = useCallback((type) =>
	{
		dispatch(TetrisActions.GameAction({ type }));
	}, [ dispatch ]);

	const clear = useCallback((type) =>
	{
		dispatch(TetrisActions.ErrorsClear());
	}, [ dispatch ]);

	// Expose --------------------------
	return {
		game,
		errors,
		suggestions,
		isGameLeader,
		validateIdFormat,
		enable,
		disable,
		list,
		create,
		join,
		leave,
		start,
		end,
		kick,
		action,
		clear,
	};
};
