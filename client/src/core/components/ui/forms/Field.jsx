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
		<div className={ `form__field` }>
			<Label htmlFor={ id }>{ label }</Label>
			{ React.cloneElement(children, { id }) }
			{ error && <Error>{ error }</Error> }
		</div>
	);
}
