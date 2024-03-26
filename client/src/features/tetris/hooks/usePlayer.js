import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TetrisActions, TetrisStore } from '../store.slice';
import { UrlUtils } from '../utilities/UrlUtils';

// Constant --------------------------------------------------------------------
const PlayerNameRegex = /^(?:\w){3,16}$/;

// Hook ------------------------------------------------------------------------
export const usePlayer = () =>
{
	const dispatch = useDispatch();
	const store = useSelector(TetrisStore);

	// Variable ------------------------
	const player = store.player;
	const errors = store.errors;

	// Callback ------------------------
	const validateNameFormat = useCallback((name) =>
	{
		if ( ! name )
		{
			return false;
		}

		if ( ! PlayerNameRegex.test(name) )
		{
			return `Invalid Format: (a-z, A-Z, 0-9, _){3, 16}`;
		}
	}, []);

	const rename = useCallback((name) =>
	{
		dispatch(TetrisActions.PlayerRename({ name }));
	}, [ dispatch ]);

	const clear = useCallback(() =>
	{
		dispatch(TetrisActions.ErrorsClear());
	}, [ dispatch ]);

	// Effect --------------------------
	useEffect(() =>
	{
		UrlUtils.set({ player: player.name });
	}, [ player.name ]);

	// Expose --------------------------
	return {
		player,
		errors,
		validateNameFormat,
		rename,
		clear,
	};
};
