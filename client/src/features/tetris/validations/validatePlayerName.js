
// Constant --------------------------------------------------------------------
const NameRegex = /^(?:\w|-){3,16}$/;

// Validate --------------------------------------------------------------------
export function validatePlayerName(name)
{
	if ( ! NameRegex.test(name) )
	{
		return `Invalid Format: Regex( ${NameRegex.source} )`;
	}
}
