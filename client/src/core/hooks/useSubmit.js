import { useRef, useState, useEffect } from "react";

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

	function submit()
	{
		setTrigger(trigger + 1);
	}

	// Expose
	return {
		formRef,
		submit
	};
}
