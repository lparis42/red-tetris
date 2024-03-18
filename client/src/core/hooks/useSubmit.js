import { useRef, useState, useEffect, useCallback } from "react";

// Hook ------------------------------------------------------------------------
export function useSubmit()
{
	const formRef = useRef(null);
	const [ trigger, setTrigger ] = useState(0);

	useEffect(() =>
	{
		if ( trigger )
		{
			formRef.current.requestSubmit();
		}
	}, [ trigger ]);

	const submit = useCallback(() =>
	{
		setTrigger((n) => n+1);
	}, [ setTrigger ]);

	// Expose
	return {
		formRef,
		submit
	};
}
