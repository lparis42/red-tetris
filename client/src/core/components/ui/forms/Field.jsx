import React, { useId } from "react";
import Label from "./Label";
import Error from "./Error";

// Component -------------------------------------------------------------------
export default function Field(
	{ label, error, children }
)
{
	const id = useId();

	return (
		<div className={ `flex flex-col gap-sm` }>
			<Label htmlFor={ id }>{ label }</Label>
			{ React.cloneElement(children, { id }) }
			{ error && <Error>{ error }</Error> }
		</div>
	);
}
