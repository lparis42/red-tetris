import { useRef, useState, useEffect, useCallback } from "react";

// Hook ------------------------------------------------------------------------
export const useSubmit = () =>
{
	const formRef = useRef(null);
	const [ trigger, setTrigger ] = useState(0);

	// Callback ------------------------
	const submit = useCallback(() =>
	{
		setTrigger((n) => n+1);
	}, [ setTrigger ]);

	// Effect --------------------------
	useEffect(() =>
	{
		if ( trigger )
		{
			formRef.current.requestSubmit();
		}
	}, [ trigger ]);

	// Expose --------------------------
	return {
		formRef,
		submit
	};
}
