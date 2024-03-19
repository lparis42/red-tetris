
// Constant --------------------------------------------------------------------
const UrlStateRegex = /^#(?<game>.*?)(?:\[(?<player>.*?)\])$/;

// Hook ------------------------------------------------------------------------
export function useUrlState()
{
	function get(key, fallback = '')
	{
		const url = UrlStateRegex.exec(window.location.hash);

		return url?.groups?.[key] ?? fallback;
	}

	function set({ game, player })
	{
		const gameId = game ?? get('game', '');
		const playerName = player ?? get('player', '');

		window.location.hash = `#${ gameId }${ ( playerName ) ? `[${ playerName }]` : ``}`;
	}

	return {
		get,
		set
	};

}
