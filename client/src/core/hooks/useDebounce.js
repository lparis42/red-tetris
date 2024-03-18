import { useState, useEffect, useRef } from "react";

// Hook ------------------------------------------------------------------------
export function useDebounce(
	value, delay
)
{
	const [ debouncedValue, setDebouncedValue ] = useState(value);
	const timerRef = useRef();

	useEffect(() =>
	{
		timerRef.current = setTimeout(() => setDebouncedValue(value), delay);

		return () =>
		{
			clearTimeout(timerRef.current);
		};
	}, [ value, delay ]);

	return debouncedValue;
}
