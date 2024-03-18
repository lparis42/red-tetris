
// Constant --------------------------------------------------------------------
const NameRegex = /^(?:\w){3,16}$/;

// Validate --------------------------------------------------------------------
export function validatePlayerName(name)
{
	if ( name && ! NameRegex.test(name) )
	{
		return `Invalid Format: (a-z, A-Z, 0-9, _){3, 16}`;
	}
}
