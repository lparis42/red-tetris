
// Constant --------------------------------------------------------------------
const UrlStateRegex = /^#(?<game>.*?)(?:\[(?<player>.*?)\])$/;

// Function --------------------------------------------------------------------
function get(key, fallback = '')
{
	const groups = UrlStateRegex.exec(window.location.hash)?.groups;
	return groups?.[key] ?? fallback;
};

function set({ game, player })
{
	const id   = game   ?? get('game');
	const name = player ?? get('player');

	window.location.hash = `#${ id }${ ( name ) ? `[${ name }]` : ``}`;
};

// Utils -----------------------------------------------------------------------
export const UrlUtils =
{
	get, set,
};
