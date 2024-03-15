import { useState, useEffect } from "react";

// Hook ------------------------------------------------------------------------
export function useInput(
	validate
)
{
	const [ value, setValue ] = useState('');
	const [ error, setError ] = useState('');

	useEffect(() =>
	{
		setError(validate?.(value) ?? '');
	}, [ value, setError, validate ]);

	// Expose
	return {
		value, setValue,
		error, setError,
	};
}
