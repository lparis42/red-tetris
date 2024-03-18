
// Constant --------------------------------------------------------------------
const GameRegex = /^(?:\w){8,16}$/;

// Validate --------------------------------------------------------------------
export function validateGameID(id)
{
	if ( id && ! GameRegex.test(id) )
	{
		return `Invalid Format: (a-z, A-Z, 0-9, _){8, 16}`;
	}
}
