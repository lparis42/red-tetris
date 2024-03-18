import { useState, useEffect } from "react";

// Constant --------------------------------------------------------------------
const UrlStateRegex = /^#(?<game>.*?)(?:\[(?<player>.*?)\])$/;

// Hook ------------------------------------------------------------------------
export function useUrlState()
{
	const [ gameId, setGameId ] = useState('');
	const [ playerName, setPlayerName ] = useState('');

	useEffect(() =>
	{
		const state = UrlStateRegex.exec(window.location.hash)

		if ( ! state )
		{
			return ;
		}

		setGameId(state.groups?.game ?? '');
		setPlayerName(state.groups?.player ?? '');
	}, [ setGameId, setPlayerName ]);

	useEffect(() =>
	{
		if ( ! gameId && ! playerName )
		{
			return ;
		}

		window.location.hash = `#${ gameId }${ ( playerName ) ? `[${ playerName }]` : ``}`;
	}, [ gameId, playerName ]);

	return {
		gameId,
		playerName,
		setGameId,
		setPlayerName,
	};

}
