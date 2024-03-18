import { useState, useEffect } from "react";

// Hook ------------------------------------------------------------------------
export function useInput(
	initialValue, validate = undefined
)
{
	const [ value, setValue ] = useState(initialValue);
	const [ error, setError ] = useState('');

	useEffect(() =>
	{
		setValue(initialValue);
	}, [ initialValue ]);

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
